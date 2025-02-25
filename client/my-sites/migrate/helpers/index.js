import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';

/**
 * Redirects the page to a target `url`.
 *
 * This is a wrapper over `page.redirect` that also pushes the URL to the history, to make the back button work properly
 * @param url The URL to redirect to
 */
export function redirectTo( url ) {
	if ( window && window.history && window.history.pushState ) {
		/**
		 * Because query parameters aren't processed by `page.show`, we're forced to use `page.redirect`.
		 * Unfortunately, `page.redirect` breaks the back button behavior.
		 * This is a Work-around to push importUrl to history to fix the back button.
		 * See https://github.com/visionmedia/page.js#readme
		 */
		window.history.pushState( null, null, url );
	}

	return page.redirect( url );
}

/**
 * Get the Import Section URL depending on if the site is Jetpack or WordPress.com Simple site.
 * If the unified importer is enabled always return the Calypso page.
 * @param siteSlug The Site Slug
 * @param isJetpack If the site is a Jetpack site
 * @returns {string} The URL that points to the import section
 */
export function getImportSectionLocation( siteSlug, isJetpack = false ) {
	return isJetpack && ! config.isEnabled( 'importer/unified' )
		? `https://${ siteSlug }/wp-admin/import.php`
		: `/import/${ siteSlug }/?engine=wordpress`;
}
// Flow mapping dictionary, key is the path segment, value is the flow name
const flowMapping = {
	'import-focused': 'import-focused',
};

export function getImportFlowByURL() {
	const url = window.location.href;
	const parsedUrl = new URL( url );
	const pathSegments = parsedUrl.pathname.split( '/' );
	// E.g. setup/import-focused/import returns import-focused
	if ( pathSegments.length >= 3 && pathSegments[ 2 ] in flowMapping ) {
		return flowMapping[ pathSegments[ 2 ] ];
	}

	return 'onboarding-flow';
}

export const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

/**
 * Returns a selector that tests if the user is newer than a given time
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserNewerThan = ( age ) => ( user ) => {
	const registrationDate = user && Date.parse( user.date );
	if ( ! registrationDate ) {
		return false;
	}
	const userAge = Date.now() - registrationDate;
	return userAge <= age;
};

export const isNewUser = isUserNewerThan( WEEK_IN_MILLISECONDS );

export function formatMigrationEventProps( user, from = '' ) {
	const migrationFlow = from ? from : getImportFlowByURL();
	return {
		is_new_user: isNewUser( user ),
		migration_flow: migrationFlow,
	};
}

export function triggerMigrationStartingEvent( user, from = '' ) {
	return recordTracksEvent(
		'calypso_migration_starting_point',
		formatMigrationEventProps( user, from )
	);
}
