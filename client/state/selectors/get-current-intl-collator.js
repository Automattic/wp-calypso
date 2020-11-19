/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

/**
 * Get an Intl.Collator() for the current locale to enable localized sorting.
 *
 * @param {object} state Redux state
 * @returns {object} Intl.Collator
 */
const getCurrentIntlCollator = ( state ) => {
	const currentLocaleSlug = getCurrentLocaleSlug( state );

	// Backup locale in case the user's locale isn't supported
	const sortLocales = [ 'en' ];

	if ( currentLocaleSlug ) {
		sortLocales.unshift( currentLocaleSlug );
	}

	return new Intl.Collator( sortLocales );
};

export default getCurrentIntlCollator;
