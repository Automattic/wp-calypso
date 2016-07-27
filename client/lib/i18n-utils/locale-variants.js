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
		const locale_variant = userSettings.getSetting( 'locale_variant' );
		switch ( locale_variant ) {
			case 'sr_latin':
				i18n.registerTranslateHook( ( translation ) => {
					return this.cyrillic_to_latin( translation );
				} );
				i18n.reRenderTranslations();
				break;
		}
	},

	cyrillic_to_latin( translation ) {
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

userSettings.on( 'change', localeVariants.init.bind( localeVariants ) );
export default localeVariants;
