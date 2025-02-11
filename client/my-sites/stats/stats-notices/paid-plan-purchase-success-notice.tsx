import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { removeStatsPurchaseSuccessParamFromCurrentUrl } from './lib/remove-stats-purchase-success-param';
import { PaidPlanPurchaseSuccessJetpackStatsNoticeProps } from './types';

const PaidPlanPurchaseSuccessJetpackStatsNotice = ( {
	isOdysseyStats,
	isCommercial = false,
}: PaidPlanPurchaseSuccessJetpackStatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const [ paramRemoved, setParamRemoved ] = useState( false );

	useEffect( () => {
		if ( paramRemoved ) {
			return;
		}
		// Ensure it runs only once.
		setParamRemoved( true );
		removeStatsPurchaseSuccessParamFromCurrentUrl( isOdysseyStats );
	}, [ paramRemoved, isOdysseyStats ] );

	const dismissNotice = () => {
		setNoticeDismissed( true );
	};

	if ( noticeDismissed ) {
		return null;
	}

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level="success"
				title={
					translate( 'Thank you for supporting %(product)s!', {
						args: { product: STATS_PRODUCT_NAME },
					} ) as string
				}
				onClose={ dismissNotice }
			>
				{ isCommercial
					? translate(
							"{{p}}You'll now get instant access to upcoming features and priority support.{{/p}}",
							{
								components: {
									p: <p />,
								},
							}
					  )
					: translate(
							"{{p}}You'll stop seeing the upgrade banners and get Email support if applicable.{{/p}}",
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
