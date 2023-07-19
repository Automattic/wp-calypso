/* eslint-disable no-console */
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps } from './types';

const PaidPlanPurchaseSuccessJetpackStatsNotice = ( { siteId }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showNotice } = useNoticeVisibilityQuery( siteId, 'paid_plan_purchase_success' );
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'paid_plan_purchase_success',
		'postponed',
		30 * 24 * 3600
	);

	const dismissNotice = () => {
		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	if ( noticeDismissed || ! showNotice ) {
		console.log( 'paidNotice noticeDismissed', noticeDismissed );
		console.log( 'paidNotice showNotice', showNotice );
		// return null;
	}

	return (
		<div className="inner-notice-container has-odyssey-stats-bg-color">
			<NoticeBanner
				level="success"
				title={ translate( 'Thank you for supporting Jetpack Stats!' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					"{{p}}You'll now get instant access to upcoming features, get priority support, and no ads in Jetpack Stats.{{/p}}",
					{
						components: {
							p: <p />,
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default PaidPlanPurchaseSuccessJetpackStatsNotice;
