/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import to_latin from 'cyrillic-to-latin';

/**
 * Internal dependencies
 */
import User from 'lib/user';
const user = new User();

const serbianLatin = {

	init() {
		const currentUser = user.get();

		if ( 'sr' !== currentUser.localeSlug ) {
			return;
		}

		i18n.registerTranslateHook( ( translation ) => {
			return serbianLatin.convert( translation );
		} );
	},

	convert( translation ) {
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

export default serbianLatin;

