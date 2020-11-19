/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

/**
 * Get an Intl.Collator() for the current user's locale to enable localized sorting.
 *
 * @param {object} state Redux state
 * @returns {object} Intl.Collator
 */
export const getIntlCollator = ( state ) => {
	const currentUserLocale = getCurrentUserLocale( state );

	// Backup locale in case the user's locale isn't supported
	const sortLocales = [ 'en' ];

	if ( currentUserLocale ) {
		sortLocales.unshift( currentUserLocale );
	}

	return new Intl.Collator( sortLocales );
};
