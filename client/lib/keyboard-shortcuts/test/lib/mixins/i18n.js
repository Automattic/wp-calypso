/**
 * Stub i18n
 */

import Emitter from 'lib/mixins/emitter';

function I18n() {
}

I18n.prototype.translate = function( string ) {
	return string;
};

Emitter( I18n.prototype );

export default new I18n();
