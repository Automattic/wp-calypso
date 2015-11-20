/**
 * User stub
 */

var isLoggedIn = false;

module.exports = function() {
	return {
		get: function() {
			return isLoggedIn;
		},

		setLoggedIn: function( newIsLoggedIn ) {
			isLoggedIn = newIsLoggedIn;
		}
	};
};
