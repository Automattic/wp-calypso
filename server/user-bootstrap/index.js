var superagent = require('superagent'),
    cookie = require('cookie'),
    debug = require('debug')('calypso:bootstrap'),
    crypto = require('crypto');

var config = require('config'),
    API_KEY = config('wpcom_calypso_rest_api_key'),
    userUtils = require('./shared-utils'),
    /**
	* WordPress.com REST API /me endpoint.
	*/
    url = 'https://public-api.wordpress.com/rest/v1/me?meta=flags';

module.exports = function(userCookie, callback) {
    // create HTTP Request object
    var req = superagent.get(url), hmac, cookies, hash;

    if (userCookie) {
        hmac = crypto.createHmac('md5', API_KEY);
        cookies = cookie.parse(userCookie);
        if (cookies.wordpress_logged_in) {
            hmac.update(cookies.wordpress_logged_in);
            hash = hmac.digest('hex');
            req.set('Authorization', 'X-WPCALYPSO ' + hash);
            req.set('Cookie', userCookie);
            req.set('User-Agent', 'WordPress.com Calypso');
        }
    }

    // start the request
    req.end(function(err, res) {
        var body, statusCode, user, error, key;

        if (err && !res) {
            return callback(err);
        }

        body = res.body;
        statusCode = res.status;

        debug('%o -> %o status code', url, statusCode);

        if (err) {
            error = new Error();
            error.statusCode = statusCode;
            for (key in body) {
                error[key] = body[key];
            }

            return callback(error);
        }

        user = userUtils.filterUserObject(body);
        callback(null, user);
    });
};
