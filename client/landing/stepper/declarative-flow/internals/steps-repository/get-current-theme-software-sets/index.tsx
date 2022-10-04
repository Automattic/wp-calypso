import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useSite } from '../../../../hooks/use-site';
import { SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';

const GetCurrentThemeSoftwareSets: Step = function GetCurrentBundledPluginsStep( { navigation } ) {
	const site = useSite();
	const isPluginBundleEligible = useIsPluginBundleEligible();
	const siteSlugParam = useSiteSlugParam();
	let siteSlug: string | null = null;
	if ( siteSlugParam ) {
		siteSlug = siteSlugParam;
	} else if ( site ) {
		siteSlug = new URL( site.URL ).host;
	}

	const reduxDispatch = useReduxDispatch();
	const { goNext } = navigation;
	useEffect( () => {
		reduxDispatch( requestActiveTheme( site?.ID || -1 ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site?.ID ] );
	const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
	const currentTheme = useSelector( ( state ) =>
		getCanonicalTheme( state, site?.ID || -1, currentThemeId )
	);
	const { setBundledPluginSlug } = useDispatch( SITE_STORE );
	useEffect( () => {
		if ( currentTheme ) {
			const theme_software_set = currentTheme?.taxonomies?.theme_software_set;
			if ( theme_software_set && siteSlug ) {
				setBundledPluginSlug( siteSlug, theme_software_set[ 0 ].slug ); // only install first software set
				goNext();
			} else {
				// Current theme has no bundled plugins; they shouldn't be in this flow
				window.location.replace( `/home/${ siteSlug }` );
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentTheme?.id ] );

	useEffect( () => {
		if ( ! isPluginBundleEligible ) {
			window.location.replace( `/home/${ siteSlug }` );
		}
	}, [ isPluginBundleEligible, siteSlug ] );

	return null;
};
export default GetCurrentThemeSoftwareSets;
