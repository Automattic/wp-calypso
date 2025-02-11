import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import illustration404 from 'calypso/assets/images/illustrations/illustration-404.svg';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { STATS_PLAN_USAGE_RECEIVE } from 'calypso/state/action-types';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { StatsGlobalValuesProvider } from '../pages/providers/global-provider';

type AsyncLoadProps = {
	children: ReactNode;
};

const enableJetpackStatsModule = ( siteId: number, path: string | null ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_jetpack_module_toggle', {
			module: 'stats',
			path,
			toggled: 'on',
		} ),
		activateModule( siteId, 'stats' )
	);

const EnableStatsModuleNotice = ( { siteId, path }: { siteId: number; path: string | null } ) => {
	const translate = useTranslate();
	return (
		<EmptyContent
			illustration={ illustration404 }
			title={ translate( 'Looking for stats?' ) }
			line={
				<p>
					{ translate(
						'Enable %(product)s to see detailed information about your traffic, likes, comments, and subscribers.',
						{ args: { product: STATS_PRODUCT_NAME } }
					) }
				</p>
			}
			action={ translate( 'Enable %(product)s', { args: { product: STATS_PRODUCT_NAME } } ) }
			actionCallback={ () => enableJetpackStatsModule( siteId, path ) }
		/>
	);
};

const InsufficientPermissionsNotice = () => {
	const translate = useTranslate();
	return (
		<EmptyContent
			illustration={ illustration404 }
			title={ translate( 'Looking for stats?' ) }
			line={
				<p>
					<div>
						{ translate( "We're sorry, but you do not have permission to access this page." ) }
					</div>
					<div>{ translate( "Please contact your site's administrator for access." ) }</div>
				</p>
			}
		/>
	);
};

export default function StatsPageLoader( { children }: AsyncLoadProps ) {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const canUserManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const canUserViewStats = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'view_stats' )
	);
	const jetpackModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state as object, siteId, 'stats' )
	);
	const path = useSelector( ( state ) => getCurrentRouteParameterized( state as object, siteId ) );

	const { isPending, data: usageInfo } = usePlanUsageQuery( siteId );
	const reduxDispatch = useDispatch();

	// Dispatch the plan usage data to the Redux store for monthly views check in shouldGateStats.
	useEffect( () => {
		reduxDispatch( {
			type: STATS_PLAN_USAGE_RECEIVE,
			siteId,
			data: usageInfo,
		} );
	}, [ reduxDispatch, isPending, siteId, usageInfo ] );

	// Odyssey Stats: This UX is not possible in Odyssey as this page would not be able to render in the first place.
	const showEnableStatsModule =
		! isOdysseyStats &&
		siteId &&
		isJetpack &&
		jetpackModuleActive === false &&
		canUserManageOptions;

	// Odyssey Stats: Access control is done in PHP, so skip capability check here.
	// TODO: Fix incorrect view_stats permission on Calypso.
	//       If the user's role is missing from the site's stats dashboard access allowlist (fetched via getJetpackSettings.role),
	//       then it should be reflected in the user's view_stats capability.
	const canUserViewStatsPage = isOdysseyStats || canUserManageOptions || canUserViewStats;

	if ( ! canUserViewStatsPage ) {
		return <InsufficientPermissionsNotice />;
	} else if ( showEnableStatsModule ) {
		return <EnableStatsModuleNotice siteId={ siteId } path={ path } />;
	}

	return (
		<StatsGlobalValuesProvider>
			<>
				<QuerySitePurchases siteId={ siteId } />
				{ children }
			</>
		</StatsGlobalValuesProvider>
	);
}
