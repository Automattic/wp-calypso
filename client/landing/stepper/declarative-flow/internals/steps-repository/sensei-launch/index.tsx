import { SenseiStepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector, useDispatch } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { ProgressingTitle } from './components';

interface InstalledPlugin {
	id: string;
	slug: string;
	active: boolean;
}

const SenseiLaunch = () => {
	const { __ } = useI18n();
	const { siteId } = useSelect( ( select ) => {
		return {
			siteId: select( ONBOARD_STORE ).getSelectedSite(),
		};
	}, [] );
	const selectSitePlugins = useCallback(
		( state ) => {
			return siteId ? getPlugins( state, [ siteId ] ) : [];
		},
		[ siteId ]
	);
	const selectSenseiLaunchUrl: () => string = useCallback(
		( state = {} ) => {
			let url = '/';
			if ( siteId ) {
				const siteAdminUrl = getSiteAdminUrl( state, siteId, 'admin.php?page=sensei' );
				if ( siteAdminUrl ) {
					url = siteAdminUrl;
				}
			}
			return url;
		},
		[ siteId ]
	);

	const dispatch = useDispatch();
	const plugins: InstalledPlugin[] = useSelector( selectSitePlugins );
	const senseiHomeUrl: string = useSelector( selectSenseiLaunchUrl );
	useEffect( () => {
		const intervalId = setInterval( () => {
			const woothemesSensei = plugins.find( ( plugin ) => plugin.slug === 'woothemes-sensei' );
			if ( ! woothemesSensei?.active ) {
				dispatch( fetchSitePlugins( siteId ) );
				return;
			}
			clearInterval( intervalId );
			fetch( senseiHomeUrl ).finally( () => {
				window.location.replace( senseiHomeUrl );
			} );
		}, 3000 );
		return () => clearInterval( intervalId );
	}, [ plugins, senseiHomeUrl, dispatch, siteId ] );

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<ProgressingTitle>{ __( 'Installing Sensei' ) }</ProgressingTitle>
		</SenseiStepContainer>
	);
};

export default SenseiLaunch;
