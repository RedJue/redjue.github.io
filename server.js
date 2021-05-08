const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
const pk = fs.readFileSync("./https/5603151_redjue.cn.key");
const pc = fs.readFileSync("./https/5603151_redjue.cn.pem");
const opt = {
  key: pk,
  cert: pc,
};
app.use("/", express.static("public"));
const server = https.createServer(opt, app);

server.listen(3001, () => console.log("Example app listening on port 3001!"));
server.on("error", (error) => {
  console.log(error);
});
