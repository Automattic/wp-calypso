import { FEATURE_SFTP } from '@automattic/calypso-products';
import { LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { convertBytes } from 'calypso/my-sites/backup/backup-contents-page/file-browser/util';
import {
	SiteMetricsAPIResponse,
	useSiteMetricsQuery,
} from 'calypso/my-sites/site-monitoring/use-metrics-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type PlanBandwidthProps = React.PropsWithChildren< {
	siteId: number;
} >;

const getCurrentMonthRangeTimestamps = () => {
	const now = new Date();
	const firstDayOfMonth = new Date( now.getFullYear(), now.getMonth(), 1 );
	const startInSeconds = Math.floor( firstDayOfMonth.getTime() / 1000 );

	const today = new Date();
	const endInSeconds = Math.floor( today.getTime() / 1000 );

	return {
		startInSeconds,
		endInSeconds,
	};
};

const AtomicSiteBandwidthUsage = ( { siteId, domain }: { siteId: number; domain: string } ) => {
	const [ bandwidthData, setBandwidthData ] = useState< SiteMetricsAPIResponse >();
	const translate = useTranslate();

	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();

	const { data } = useSiteMetricsQuery(
		siteId,
		{
			start: startInSeconds,
			end: endInSeconds,
			metric: 'response_bytes_persec',
		},
		! bandwidthData
	);

	if ( ! data && ! bandwidthData ) {
		return <LoadingPlaceholder className="hosting-overview__plan-bandwidth-placeholder" />;
	}

	if ( ! bandwidthData ) {
		setBandwidthData( data );
		return;
	}

	const valueInBytes = bandwidthData.data.periods.reduce(
		( acc, curr ) => acc + ( curr.dimension[ domain ] || 0 ),
		0
	);

	const { unitAmount, unit } = convertBytes( valueInBytes );

	return translate( '%(value)s %(measure)s used', {
		args: { value: unitAmount, measure: unit },
		comment:
			'The amount of data that has been used by the site in the current month in KB/MB/GB/TB',
	} );
};

export function PlanBandwidth( { siteId }: PlanBandwidthProps ) {
	const selectedSiteData = useSelector( getSelectedSite );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const canViewStat = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );
	const hasSftpFeature = useSelector( ( state ) => siteHasFeature( state, siteId, FEATURE_SFTP ) );

	const isEligibleForAtomic = ! isAtomic && hasSftpFeature;

	const selectedSiteDomain = selectedSiteData?.domain;

	const translate = useTranslate();

	if ( ! canViewStat ) {
		return;
	}

	const getBandwidthContent = () => {
		if ( ! isAtomic || ! selectedSiteDomain ) {
			return translate( 'Not available', {
				comment:
					'A message that indicates that the bandwidth data is not available for sites that are not atomic',
			} );
		}

		return <AtomicSiteBandwidthUsage siteId={ siteId } domain={ selectedSiteDomain } />;
	};

	const getBandwidthFooterLink = () => {
		if ( isAtomic ) {
			return (
				<a href={ `/site-monitoring/${ siteSlug }` }>
					{ translate( 'Monitor site performance', {
						comment: 'A link to the "Monitoring" tab of the Hosting Overview',
					} ) }
				</a>
			);
		}

		if ( isEligibleForAtomic ) {
			return (
				<a href={ `/hosting-features/${ siteSlug }` }>
					{ translate( 'Activate hosting features', {
						comment: 'A link to the Hosting Features page to click an activation button',
					} ) }
				</a>
			);
		}

		return (
			<a href={ `/hosting-features/${ siteSlug }` }>
				{ translate( 'Upgrade to monitor site', {
					comment: 'A link to the Hosting Features page to click an upgrade button',
				} ) }
			</a>
		);
	};

	return (
		<div className="hosting-overview__plan-bandwidth">
			<div className="hosting-overview__plan-bandwidth-title-wrapper">
				<div className="hosting-overview__plan-bandwidth-title">
					{ translate( 'Bandwidth', {
						comment: 'The title of the bandwidth section of site stats',
					} ) }
				</div>
				<div>
					{ translate( 'Unlimited', { comment: 'An indicator that bandwidth is unlimited' } ) }
				</div>
			</div>
			<div className="hosting-overview__plan-bandwidth-content">{ getBandwidthContent() }</div>
			{ getBandwidthFooterLink() }
		</div>
	);
}
