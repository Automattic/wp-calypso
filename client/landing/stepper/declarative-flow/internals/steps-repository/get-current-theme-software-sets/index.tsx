import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import getHasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
import getIsRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useSite } from '../../../../hooks/use-site';
import { SITE_STORE } from '../../../../stores';
import type { Step } from '../../types';

const debug = debugFactory( 'calypso:stepper:get-current-theme-software-sets' );

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
		debug( 'Dispatching requests for active theme and features' );
		reduxDispatch( requestActiveTheme( site?.ID || -1 ) );
		reduxDispatch( fetchSiteFeatures( site?.ID || -1 ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ site?.ID ] );
	const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
	const currentTheme = useSelector( ( state ) =>
		getCanonicalTheme( state, site?.ID || -1, currentThemeId )
	);
	const isRequestingSiteFeatures: boolean = useSelector( ( state ) =>
		getIsRequestingSiteFeatures( state, site?.ID || -1 )
	);
	const hasLoadedSiteFeatures: boolean = useSelector( ( state ) =>
		getHasLoadedSiteFeatures( state, site?.ID || -1 )
	);
	const { setBundledPluginSlug } = useDispatch( SITE_STORE );
	useEffect( () => {
		if ( currentTheme ) {
			const theme_software_set = currentTheme?.taxonomies?.theme_software_set;
			if ( theme_software_set && siteSlug ) {
				setBundledPluginSlug( siteSlug, theme_software_set[ 0 ].slug ); // only install first software set
				goNext();
			} else {
				debug( 'Redirected because theme has no bundled software', {
					currentTheme,
					theme_software_set,
					siteSlug,
				} );
				// Current theme has no bundled plugins; they shouldn't be in this flow
				window.location.replace( `/home/${ siteSlug }` );
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentTheme?.id ] );

	useEffect( () => {
		if ( hasLoadedSiteFeatures && ! isRequestingSiteFeatures && ! isPluginBundleEligible ) {
			debug( 'Redirected because features missing', {
				isPluginBundleEligible,
				siteSlug,
				isRequestingSiteFeatures,
				hasLoadedSiteFeatures,
			} );
			window.location.replace( `/home/${ siteSlug }` );
		}
	}, [ isPluginBundleEligible, siteSlug, isRequestingSiteFeatures, hasLoadedSiteFeatures ] );

	return null;
};
export default GetCurrentThemeSoftwareSets;
