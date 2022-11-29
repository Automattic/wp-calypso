import { SenseiStepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector, useDispatch as useRootDispatch } from 'react-redux';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { Progress, SenseiStepProgress } from '../sensei-setup/sensei-step-progress';

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
	const [ retries, setRetries ] = useState< number >( 0 );

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
	const expectedRetries = 15;
	const maxRetries = 40;

	useEffect( () => {
		const intervalId = setInterval( () => {
			const woothemesSensei = plugins.find( ( plugin ) => plugin.slug === 'woothemes-sensei' );
			if ( ! woothemesSensei?.active && retries < maxRetries ) {
				setRetries( retries + 1 );
				dispatch( fetchSitePlugins( siteId ) );
				return;
			}

			setRetries( -1 );
			clearInterval( intervalId );

			setTimeout( () => {
				if ( launchpadScreen !== 'full' ) {
					saveSiteSettings( siteId as number, { launchpad_screen: 'full' } ).finally( () => {
						window.location.replace( launchpadUrl );
					} );
				} else {
					window.location.replace( launchpadUrl );
				}
			}, 800 );
		}, 3000 );

		return () => clearInterval( intervalId );
	}, [ plugins, launchpadUrl, dispatch, siteId, saveSiteSettings, launchpadScreen ] );

	const progress: Progress = {
		percentage: ( retries * 100 ) / expectedRetries,
		title: __( 'Installing Sensei' ),
	};

	if ( retries > expectedRetries / 2 || retries < 0 ) {
		progress.title = __( 'Setting up your new Sensei Home' );
	}

	// Slow down progress bar increase during the last steps.
	if ( retries > ( expectedRetries * 2 ) / 3 ) {
		const slowPercentage = 66.6 + ( retries * 15 ) / expectedRetries;
		progress.percentage = slowPercentage > 90 ? 90 : slowPercentage;
	} else if ( retries < 0 ) {
		progress.percentage = 100;
	}

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<SenseiStepProgress progress={ progress } />
		</SenseiStepContainer>
	);
};

export default SenseiLaunch;
