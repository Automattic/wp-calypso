import { mapValues } from 'lodash';
import { BaseSyntheticEvent } from 'react';
import titlecase from 'to-title-case';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { isMagnificentLocale } from 'calypso/lib/i18n-utils';

interface ThemeOption {
	action?: () => void;
	extendedLabel?: string;
	getUrl?: () => string;
	header?: string;
	hideForTheme?: () => void;
	icon?: string;
	label?: string;
	separator?: boolean;
}

interface ThemeOptions {
	[ key: string ]: ThemeOption;
}

export function trackClick( componentName: string, eventName: BaseSyntheticEvent, verb = 'click' ) {
	const stat = `${ componentName } ${ eventName } ${ verb }`;
	gaRecordEvent( 'Themes', titlecase( stat ) );
}

export function addTracking( options: ThemeOptions ): ThemeOptions {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option: ThemeOption, name: string ): ThemeOption {
	const { action } = option;

	return Object.assign( {}, option, {
		action: ( t ) => {
			action && action( t );
			trackClick( 'more button', name );
		},
	} );
}

export function getAnalyticsData(
	path: string,
	{
		filter,
		vertical,
		tier,
		site_id,
	}: {
		filter: string | undefined;
		vertical: string | undefined;
		tier: string | undefined;
		site_id: string | undefined;
	}
) {
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

export function localizeThemesPath( path: string, locale: string, isLoggedOut = true ): string {
	const shouldPrefix = isLoggedOut && isMagnificentLocale( locale ) && path.startsWith( '/theme' );

	return shouldPrefix ? `/${ locale }${ path }` : path;
}
