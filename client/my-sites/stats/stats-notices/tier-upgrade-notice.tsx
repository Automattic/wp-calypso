import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import usePlanUsageQuery from 'calypso/my-sites/stats/hooks/use-plan-usage-query';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/tier-upgrade-slider&from=${ from }-stats-tier-upgrade-notice&productType=commercial`;

	return purchasePath;
};

const TierUpgradeNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'tier_upgrade',
		'postponed',
		7 * 24 * 3600
	);

	const dismissNotice = () => {
		isOdysseyStats
			? recordTracksEvent( 'jetpack_odyssey_stats_tier_upgrade_notice_dismissed' )
			: recordTracksEvent( 'calypso_stats_tier_upgrade_notice_dismissed' );

		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	const gotoJetpackStatsProduct = () => {
		// Analytics events are now captured at the destination.
		page( getStatsPurchaseURL( siteId, isOdysseyStats ) );
	};

	// TODO: Consolidate the query here with the usage section on the Traffic page.
	const { data } = usePlanUsageQuery( siteId );
	const currentUsage = data?.current_usage.views_count || 0;
	const tierLimit = data?.views_limit || null;

	const showNotice = tierLimit ? currentUsage / tierLimit >= 0.9 : false;
	const isOverLimit = tierLimit ? currentUsage / tierLimit >= 1 : false;

	const bannerTitle = isOverLimit
		? translate( 'You have reached your views limit' )
		: translate( 'You are nearing your monthly limit' );
	const bannerBody = isOverLimit
		? translate(
				'{{p}}Your access to the traffic dashboard may be disrupted in the future without an upgrade.{{/p}}',
				{
					components: {
						p: <p />,
					},
				}
		  )
		: translate(
				'{{p}}Your site is receiving more attention and is close to the monthly view limit provided by your current plan. Consider increasing your tier limit to avoid potential service disruptions.{{/p}}',
				{
					components: {
						p: <p />,
					},
				}
		  );

	if ( noticeDismissed || ! showNotice ) {
		return null;
	}

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level={ isOverLimit ? 'error' : 'warning' }
				title={ bannerTitle }
				onClose={ dismissNotice }
			>
				<>
					{ bannerBody }
					{ translate(
						'{{p}}{{jetpackStatsProductLink}}Upgrade now{{/jetpackStatsProductLink}}{{/p}}',
						{
							components: {
								p: <p />,
								jetpackStatsProductLink: (
									<button
										type="button"
										className="notice-banner__action-button"
										onClick={ gotoJetpackStatsProduct }
									/>
								),
							},
						}
					) }
				</>
			</NoticeBanner>
		</div>
	);
};

export default TierUpgradeNotice;
