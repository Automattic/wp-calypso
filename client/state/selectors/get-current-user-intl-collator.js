/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

/**
 * Get an Intl.Collator() for the current user's locale to enable localized sorting.
 *
 * @param {object} state Redux state
 * @returns {object} Intl.Collator
 */
const getCurrentUserIntlCollator = ( state ) => {
	const currentUserLocaleSlug = getCurrentLocaleSlug( state );

	// Backup locale in case the user's locale isn't supported
	const sortLocales = [ 'en' ];

	if ( currentUserLocaleSlug ) {
		sortLocales.unshift( currentUserLocaleSlug );
	}

	return new Intl.Collator( sortLocales );
};

export default getCurrentUserIntlCollator;
