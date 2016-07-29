/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import to_latin from 'cyrillic-to-latin';

/**
 * Internal dependencies
 */
import User from 'lib/user';
import userSettings from 'lib/user-settings';
const user = new User();

var _tlEnabled = false,
	initialized = false;

const serbianLatin = {

	isEnabled() {
		const currentUser = user.get();

		if ( 'sr' !== currentUser.localeSlug ) {
			return this.toggle( false );
		}

		if ( ! userSettings.getOriginalSetting( 'enable_sr_latin' ) ) {
			return this.toggle( false );
		}

		return this.toggle( true );
	},

	init() {
		if ( ! this.isEnabled() ) {
			return;
		}

		if ( initialized ) {
			return;
		}

		initialized = true;
		i18n.registerTranslateHook( ( translation ) => {
			return this.convert( translation );
		} );
		i18n.reRenderTranslations();
	},

	toggle( toState ) {
		if ( _tlEnabled !== toState ) {
			_tlEnabled = toState;
			i18n.reRenderTranslations();
		}

		return _tlEnabled;
	},

	convert( translation ) {
		if ( ! _tlEnabled ) {
			return translation;
		}

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

i18n.on( 'change', serbianLatin.init.bind( serbianLatin ) );
userSettings.on( 'change', serbianLatin.init.bind( serbianLatin ) );

export default serbianLatin;

