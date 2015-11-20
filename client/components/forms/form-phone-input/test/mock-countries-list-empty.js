/**
 * External dependencies
 */
var emitter = require( 'lib/mixins/emitter' );

var countriesList = {
	get: function() {
		return {};
	}
};

emitter( countriesList );

module.exports = countriesList;
