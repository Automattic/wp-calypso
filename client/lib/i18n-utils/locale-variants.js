/**
 * External dependencies
 */
import debugFactory from 'debug';
import to_latin from 'cyrillic-to-latin';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';

const debug = debugFactory( 'calypso:i18n' );

const localeVariants = {
	init() {
		const localeVariant = userSettings.getSetting( 'locale_variant' );
		switch ( localeVariant ) {
			case 'sr_latin':
				debug( 'Applying mods for ' + localeVariant );
				i18n.registerTranslateHook( ( translation ) => {
					return this.cyrillicToLatin( translation );
				} );
				i18n.reRenderTranslations();
				break;
		}
	},

	cyrillicToLatin( translation ) {
		switch ( typeof( translation ) ) {
			case 'object':
				for ( let prop in translation ) {
					if ( typeof prop === 'string' ) {
						prop = to_latin( prop );
					}
				}
				break;
			case 'string':
				translation = to_latin( translation );
				break;
		}

		return translation;
	}
};

export default localeVariants;
