/**
 * External dependencies
 */
var emitter = require( 'lib/mixins/emitter' );

var countriesList = {
	get: function() {
		return [
			{
				code: 'US', name: 'United States (+1)', numeric_code: '+1', country_name: 'United States'
			},
			{
				code: 'AR', name: 'Argentina (+54)', numeric_code: '+54', country_name: 'Argentina'
			}
		];
	}
};

emitter( countriesList );

module.exports = countriesList;
