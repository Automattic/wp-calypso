/**
 * External dependencies
 */
import emitter from 'lib/mixins/emitter';

var countriesList = {
	get: function() {
		return {};
	}
};

emitter( countriesList );

export default countriesList;
