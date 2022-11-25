import { SenseiStepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector, useDispatch as useRootDispatch } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { SenseiStepProgress } from '../sensei-setup/sensei-step-progress';

interface InstalledPlugin {
	id: string;
	slug: string;
	active: boolean;
}

const SenseiLaunch = () => {
	const { __ } = useI18n();
	const site = useSite();
	const siteId = site?.ID;
	const launchpadScreen = site?.options.launchpad_screen;
	const siteSlug = useSiteSlugParam();

	const selectSitePlugins = useCallback(
		( state ) => {
			return siteId ? getPlugins( state, [ siteId ] ) : [];
		},
		[ siteId ]
	);
	const dispatch = useRootDispatch();
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const plugins: InstalledPlugin[] = useSelector( selectSitePlugins );
	const launchpadUrl = `/setup/sensei/launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }`;

	useEffect( () => {
		const intervalId = setInterval( () => {
			const woothemesSensei = plugins.find( ( plugin ) => plugin.slug === 'woothemes-sensei' );
			if ( ! woothemesSensei?.active ) {
				dispatch( fetchSitePlugins( siteId ) );
				return;
			}

			clearInterval( intervalId );
			if ( launchpadScreen !== 'full' ) {
				saveSiteSettings( siteId as number, { launchpad_screen: 'full' } ).finally( () => {
					window.location.replace( launchpadUrl );
				} );
			} else {
				window.location.replace( launchpadUrl );
			}
		}, 3000 );

		return () => clearInterval( intervalId );
	}, [ plugins, launchpadUrl, dispatch, siteId, saveSiteSettings, launchpadScreen ] );

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<SenseiStepProgress>{ __( 'Installing Sensei' ) }</SenseiStepProgress>
		</SenseiStepContainer>
	);
};

export default SenseiLaunch;
