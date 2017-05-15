/**
 * User stub
 */

var isLoggedIn = false;

export default function() {
	return {
		get: function() {
			return isLoggedIn;
		},

		setLoggedIn: function( newIsLoggedIn ) {
			isLoggedIn = newIsLoggedIn;
		}
	};
};
