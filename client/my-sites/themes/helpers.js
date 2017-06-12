/**
 * External dependencies
 */
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import mapValues from 'lodash/mapValues';

/**
 * Internal dependencies
 */
import { sectionify } from 'lib/route/path';

export function trackClick( componentName, eventName, verb = 'click' ) {
	const stat = `${ componentName } ${ eventName } ${ verb }`;
	analytics.ga.recordEvent( 'Themes', titlecase( stat ) );
}

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	return Object.assign( {}, option, {
		action: t => {
			action && action( t );
			trackClick( 'more button', name );
		}
	} );
}

export function getAnalyticsData( path, tier, site_id ) {
	let basePath = sectionify( path );
	let analyticsPageTitle = 'Themes';

	if ( tier ) {
		basePath += '/type/:tier';
	}

	if ( site_id ) {
		basePath += '/:site_id';
		analyticsPageTitle += ' > Single Site';
	}

	if ( tier ) {
		analyticsPageTitle += ` > Type > ${ titlecase( tier ) }`;
	}

	return { basePath, analyticsPageTitle };
}
