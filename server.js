// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');

cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist.length
    ? originWhitelist
    : ['https://speakeasy-production-c15b.up.railway.app'], // ✅ Set allowed origin

  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
  ],
  redirectSameOrigin: true,

  // ✅ Inject correct CORS headers (this is the fix)
  setHeaders: {
    'access-control-allow-origin': 'https://speakeasy-production-c15b.up.railway.app',
    'access-control-allow-credentials': 'true'
  },

  httpProxyOptions: {
    xfwd: false,
  }
}).listen(port, host, function () {
  console.log('✅ CORS Proxy running on ' + host + ':' + port);
});
