import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { JETPACK_STATS_PRODUCT_LANDING_PAGE_URL } from '@automattic/calypso-products';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
// import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps } from './types';

// const getStatsPurchaseURL = ( siteId: number | null ) => {
// 	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-stats`;
// 	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
// 	if ( ! isOdysseyStats ) {
// 		return purchasePath;
// 	}
// 	return `https://wordpress.com${ purchasePath }`;
// };

const FreePlanPurchaseSuccessJetpackStatsNotice = ( { siteId }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showNotice } = useNoticeVisibilityQuery(
		siteId,
		'jetpack_stats_free_plan_purchase_success'
	);
	// const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
	// 	siteId,
	// 	'do_you_love_jetpack_stats',
	// 	'postponed',
	// 	30 * 24 * 3600
	// );

	const dismissNotice = () => {
		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	// const gotoJetpackStatsProduct = () => {
	// 	isOdysseyStats
	// 		? recordTracksEvent(
	// 				'jetpack_odyssey_stats_free_plan_purchase_success_notice_support_button_clicked'
	// 		  )
	// 		: recordTracksEvent(
	// 				'calypso_stats_free_plan_purchase_success_notice_support_button_clicked'
	// 		  );
	// 	// Allow some time for the event to be recorded before redirecting.
	// 	setTimeout( () => ( window.location.href = getStatsPurchaseURL( siteId ) ), 250 );
	// };

	useEffect( () => {
		if ( ! noticeDismissed && showNotice ) {
			isOdysseyStats
				? recordTracksEvent( 'jetpack_odyssey_stats_free_plan_purchase_success_notice_viewed' )
				: recordTracksEvent( 'calypso_stats_free_plan_purchase_success_notice_viewed' );
		}
	}, [ noticeDismissed, showNotice, isOdysseyStats ] );

	if ( noticeDismissed || ! showNotice ) {
		return null;
	}

	return (
		<div className="inner-notice-container has-odyssey-stats-bg-color">
			<NoticeBanner
				level="info"
				title={ translate( 'Thank you for using Jetpack Stats!' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}We appreciate your continued support. If you want to access upcoming features,{{jetpackStatsProductLink}} please consider upgrading.{{/jetpackStatsProductLink}}{{/p}}',
					{
						components: {
							p: <p />,
							jetpackStatsProductLink: (
								<a
									// className="notice-banner__action-link"
									href={ JETPACK_STATS_PRODUCT_LANDING_PAGE_URL }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default FreePlanPurchaseSuccessJetpackStatsNotice;
