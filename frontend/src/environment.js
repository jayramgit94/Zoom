let IS_PROD = false;
const server = IS_PROD
  ? "https://zoom-zako.onrender.com"
  : "http://localhost:8001";

export default server;
