/** @format */
/**
 * Local variables
 */

/**
 * Stub user-settings module to avoid its dependency on the browser
 **/
function UserSettings() {
	if ( ! ( this instanceof UserSettings ) ) {
		return new UserSettings();
	}
	this._hasSettings = true;
	this.settings = {};
}

UserSettings.prototype.hasSettings = function() {
	return this.hasSettings;
};

UserSettings.prototype.on = function() {};

/**
 * direct method to enable community translator
 */
UserSettings.prototype.enableTranslator = function() {
	this.settings.enable_translator = true;
};

module.exports = UserSettings();
