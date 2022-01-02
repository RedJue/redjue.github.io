const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
const pk = fs.readFileSync("https/redjue.cn.key", "utf-8");
const pc = fs.readFileSync("https/redjue.cn_bundle.crt", "utf-8");
const opt = {
  key: pk,
  cert: pc,
};
app.use("/", express.static("public"));
const server = https.createServer(opt, app);

server.listen(443, () => console.log("Example app listening on port 443!"));
server.on("error", (error) => {
  console.log(error);
});
