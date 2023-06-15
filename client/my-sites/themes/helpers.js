import { isEnabled } from '@automattic/calypso-config';
import { isMagnificentLocale, addLocaleToPath } from '@automattic/i18n-utils';
import { mapValues } from 'lodash';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { RETIRED_THEME_SLUGS_SET } from 'calypso/state/themes/constants';

export function trackClick( componentName, eventName, verb = 'click' ) {
	const stat = `${ componentName } ${ eventName } ${ verb }`;
	gaRecordEvent( 'Themes', titlecase( stat ) );
}

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	return Object.assign( {}, option, {
		action: ( t, context ) => {
			action && action( t );
			context && trackClick( context, name );
		},
	} );
}

export function getAnalyticsData( path, { filter, vertical, tier, site_id } ) {
	let analyticsPath = '/themes';
	let analyticsPageTitle = 'Themes';

	if ( vertical ) {
		analyticsPath += `/${ vertical }`;
	}

	if ( tier ) {
		analyticsPath += `/${ tier }`;
	}

	if ( filter ) {
		analyticsPath += `/filter/${ filter }`;
	}

	if ( site_id ) {
		analyticsPath += '/:site';
		analyticsPageTitle += ' > Single Site';
	}

	if ( tier ) {
		analyticsPageTitle += ` > Type > ${ titlecase( tier ) }`;
	}

	return { analyticsPath, analyticsPageTitle };
}

export function localizeThemesPath( path, locale, isLoggedOut = true ) {
	const shouldLocalizePath = isLoggedOut && isMagnificentLocale( locale );

	if ( ! shouldLocalizePath ) {
		return path;
	}

	if ( path.startsWith( '/theme' ) ) {
		return `/${ locale }${ path }`;
	}

	if ( path.startsWith( '/start/with-theme' ) ) {
		return addLocaleToPath( path, locale );
	}

	return path;
}

export function addStyleVariation( options, styleVariation, isLoggedIn ) {
	return mapValues( options, ( option ) =>
		Object.assign( {}, option, {
			...( option.getUrl && {
				getUrl: ( t ) =>
					isLoggedIn
						? option.getUrl( t, styleVariation )
						: option.getUrl( t, null, styleVariation ),
			} ),
		} )
	);
}

export function appendStyleVariationToThemesPath( path, styleVariation ) {
	if ( ! styleVariation ) {
		return path;
	}

	const [ base, query ] = path.split( '?' );
	const params = new URLSearchParams( query );
	params.set( 'style_variation', styleVariation.slug );

	return `${ base }?${ params.toString() }`;
}

/**
 * Creates the billing product slug for a given theme ID.
 *
 * @param themeId Theme ID
 * @returns string
 */
export function marketplaceThemeBillingProductSlug( themeId ) {
	return `wp-mp-theme-${ themeId }`;
}

export function getSubjectsFromTermTable( filterToTermTable ) {
	return Object.keys( filterToTermTable )
		.filter( ( key ) => key.indexOf( 'subject:' ) !== -1 )
		.reduce( ( obj, key ) => {
			obj[ key ] = filterToTermTable[ key ];
			return obj;
		}, {} );
}

/**
 * Interlace WP.com themes with WP.org themes according to the logic below:
 * - WP.org themes are only included if there is a search term.
 * - If the search term has an exact match (either a WP.com or a WP.org theme), that theme is the first result.
 * - WP.com themes are prioritized over WP.org themes.
 * - Retired WP.org themes or duplicate WP.org themes (those that are also WP.com themes) are excluded.
 * - WP.org block themes are prioritized over WP.org classic themes.
 *
 * @param wpComThemes List of WP.com themes.
 * @param wpOrgThemes List of WP.org themes.
 * @param searchTerm Search term.
 * @param isLastPage Whether the list of WP.com themes has reached the last page.
 */
export function interlaceThemes( wpComThemes, wpOrgThemes, searchTerm, isLastPage ) {
	const isMatchingTheme = ( theme ) => {
		if ( ! searchTerm ) {
			return false;
		}
		return (
			theme.name?.toLowerCase() === searchTerm?.toLowerCase() ||
			theme.id?.toLowerCase() === searchTerm?.toLowerCase()
		);
	};

	const includeWpOrgThemes = !! searchTerm;
	const wpComThemesSlugs = wpComThemes.map( ( theme ) => theme.id );
	const validWpOrgThemes = includeWpOrgThemes
		? wpOrgThemes.filter(
				( theme ) =>
					! wpComThemesSlugs.includes( theme?.id?.toLowerCase() ) && // Avoid duplicate themes. Some free themes are available in both wpcom and wporg.
					! RETIRED_THEME_SLUGS_SET.has( theme?.id?.toLowerCase() ) // Avoid retired themes.
		  )
		: [];

	const interlacedThemes = [];

	// 1. Exact match.
	const matchingTheme =
		wpComThemes.find( isMatchingTheme ) || validWpOrgThemes.find( isMatchingTheme );
	if ( matchingTheme ) {
		interlacedThemes.push( matchingTheme );
	}

	// 2. WP.com themes.
	const restWpComThemes = matchingTheme
		? wpComThemes.filter( ( theme ) => theme.id !== matchingTheme.id )
		: wpComThemes;
	interlacedThemes.push( ...restWpComThemes );

	// 3. WP.org themes (only if the list of WP.com themes has reached the last page).
	if ( isEnabled( 'themes/interlaced-dotorg-themes' ) && isLastPage ) {
		// 3.1. WP.org block themes.
		const restWpOrgBlockThemes = validWpOrgThemes.filter(
			( theme ) =>
				theme.id !== matchingTheme?.id &&
				theme.taxonomies?.theme_feature?.some(
					( feature ) => feature?.slug === 'full-site-editing'
				)
		);
		interlacedThemes.push( ...restWpOrgBlockThemes );

		// 3.2 WP.org classic themes.
		const restWpOrgClassicThemes = validWpOrgThemes.filter(
			( theme ) =>
				theme.id !== matchingTheme?.id &&
				( ! theme.taxonomies ||
					! theme.taxonomies.theme_feature ||
					theme.taxonomies.theme_feature.every(
						( feature ) => feature?.slug !== 'full-site-editing'
					) )
		);
		interlacedThemes.push( ...restWpOrgClassicThemes );
	}

	return interlacedThemes;
}
