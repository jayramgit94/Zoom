let IS_PROD = false;
const server = IS_PROD
  ? "https://zoom-call-yor3.onrender.com"
  : "http://localhost:8002";

export default server;
