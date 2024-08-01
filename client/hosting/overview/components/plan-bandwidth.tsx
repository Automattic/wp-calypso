import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { convertBytes } from 'calypso/my-sites/backup/backup-contents-page/file-browser/util';
import { useSiteMetricsQuery } from 'calypso/my-sites/site-monitoring/use-metrics-query';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface PlanBandwidthProps {
	children?: React.ReactNode;
	siteId: number;
	className?: string;
}

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

export function PlanBandwidth( { siteId }: PlanBandwidthProps ) {
	const selectedSiteData = useSelector( getSelectedSite );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteData?.ID ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSiteData?.ID ) );

	const selectedSiteDomain = selectedSiteData?.domain;
	const planDetails = selectedSiteData?.plan;

	const translate = useTranslate();

	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();

	const { data } = useSiteMetricsQuery( siteId, {
		start: startInSeconds,
		end: endInSeconds,
		metric: 'response_bytes_persec',
	} );

	if ( ! data || ! selectedSiteDomain ) {
		return;
	}

	const valueInBytes = data.data.periods.reduce(
		( acc, curr ) => acc + ( curr.dimension[ selectedSiteDomain ] || 0 ),
		0
	);

	const { unitAmount, unit } = convertBytes( valueInBytes );

	const getBandwidthFooter = () => {
		const eligibleForAtomic =
			planDetails &&
			( isBusinessPlan( planDetails?.product_slug ) ||
				isEcommercePlan( planDetails?.product_slug ) );

		if ( isAtomic ) {
			return (
				<a href={ `/site-monitoring/${ siteSlug }` }>
					{ translate( "Monitor your site's performance", {
						comment: 'A link to the "Monitoring" tab of the Hosting Overview',
					} ) }
				</a>
			);
		}

		return (
			<a href={ `/hosting-features/${ siteSlug }` }>
				{ eligibleForAtomic
					? translate( 'Activate hosting features to monitor site performance', {
							comment: 'A link to the Hosting Features page to click an activation button',
					  } )
					: translate( "Want to monitor your site's performance?", {
							comment: 'A link to the Hosting Features page to click an upgrade button',
					  } ) }
			</a>
		);
	};

	return (
		<div className="hosting-overview__plan-bandwidth-wrapper">
			<div className="hosting-overview__plan-bandwidth-content">
				{ translate( 'Bandwidth: {{span}}%(value)s %(measure)s used{{/span}}', {
					args: { value: unitAmount, measure: unit },
					components: {
						span: <span className="plan-bandwidth-content__value" />,
					},
					comment:
						'A description of the amount of data that has been used by the site in the current month',
				} ) }
			</div>
			<div className="hosting-overview__plan-bandwidth-footer">{ getBandwidthFooter() }</div>
		</div>
	);
}
