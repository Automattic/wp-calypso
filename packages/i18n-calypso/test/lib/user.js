/**
 * Local variables
 */
var defaults = {
	localeSlug: 'de'
};

/**
 * Stub user module to avoid its dependency on the browser
 **/
function User() {
	if ( ! ( this instanceof User ) ) {
		return new User();
	}
}

User.prototype.get = function() {
	return defaults;
};
User.prototype.on = function() {};
User.prototype.fetchSettings = function() {};

/**
 * direct method to enable community translator
 */

module.exports = User;
