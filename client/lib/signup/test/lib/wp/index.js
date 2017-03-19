/**
 * lib/wp stub
 */

export default {
	loadToken: function( token ) {
		this._token = token;
	},

	isTokenLoaded: function() {
		return this._token !== undefined;
	}
};
