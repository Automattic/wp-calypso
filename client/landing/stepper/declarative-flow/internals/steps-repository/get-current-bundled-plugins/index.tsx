import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
// import { StepContainer } from '@automattic/onboarding';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
// import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';

const GetCurrentBundledPlugins: Step = function GetCurrentBundledPluginsStep( { navigation } ) {
	const site = useSite();
	const siteSlugParam = useSiteSlugParam();
	let siteSlug: string | null = null;
	if ( siteSlugParam ) {
		siteSlug = siteSlugParam;
	} else if ( site ) {
		siteSlug = new URL( site.URL ).host;
	}

	const reduxDispatch = useReduxDispatch();
	const { goBack, goNext, submit } = navigation;
	useEffect( () => {
		reduxDispatch( requestActiveTheme( site?.ID || -1 ) );
	}, [ site?.ID ] );
	const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
	const currentTheme = useSelector( ( state ) =>
		getCanonicalTheme( state, site?.ID || -1, currentThemeId )
	);
	const { setBundledPluginSlug } = useDispatch( ONBOARD_STORE );
	useEffect( () => {
		if ( currentTheme ) {
			const theme_plugin = currentTheme?.taxonomies?.theme_plugin;
			if ( theme_plugin && siteSlug ) {
				setBundledPluginSlug( siteSlug, theme_plugin[ 0 ].slug ); // only install first plugin
			}
			goNext();
		}
	}, [ currentTheme?.id ] );
	console.log( { currentTheme } );
	return null;
	/*
	return (
		<StepContainer
			stepName={ 'get-current-bundled-plugins' }
			stepContent={
				<div>hi</div>
			}
		/>
	);
	 */
};
export default GetCurrentBundledPlugins;
