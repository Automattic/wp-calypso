/** @format */
/**
 * lib/wp stub
 */

module.exports = {
	loadToken: function( token ) {
		this._token = token;
	},

	isTokenLoaded: function() {
		return this._token !== undefined;
	},
};
