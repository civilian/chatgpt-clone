import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/', async (req, res) => {
  try {

    if (req.body.token != process.env.TOKEN){
        throw 'Invalid token';
    }
    let prompt = await req.body.prompt;
    console.log("/", "ip=", req.ip, "prompt=", prompt);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      user: String(req.ip), // the user
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error("TOKEN:", process.env.TOKEN, "API_KEY", process.env.OPENAI_API_KEY,"error");
    res.status(500).send(error || 'Something went wrong');
  }
})

app.post('/img', async (req, res) => {

  var err = "";
  try {
    if (req.body.token != process.env.TOKEN){
        throw 'Invalid token';
    }
    let prompt_ = req.body.prompt;
    prompt_ = prompt_.slice(0, 400);
    console.log("img", "ip=", req.ip, "prompt=", prompt_);
    const response = await openai.createImage({
            prompt: prompt_,
            n: 1,
            size: "512x512",
            user: String(req.ip),
        },{
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            }
    });
    err = response.request.error
    res.status(200).send({
      url: response.data.data[0].url
    });

  } catch (error) {
    console.error(err);
    console.error(error);
    console.error("TOKEN:", process.env.TOKEN, "API_KEY", process.env.OPENAI_API_KEY,"error");
    res.status(500).send(err || error || 'Something went wrong');
  }
})

app.use(
  cors({origin: 'null'})
);

var server = app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
server.timeout = 60000;