import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { removeStatsPurchaseSuccessParamFromCurrentUrl } from './lib/remove-stats-purchase-success-param';
import { PaidPlanPurchaseSuccessJetpackStatsNoticeProps } from './types';

const PaidPlanPurchaseSuccessJetpackStatsNotice = ( {
	isOdysseyStats,
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
				title={ translate( 'Thank you for supporting Jetpack Stats!' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					"{{p}}You'll now get instant access to upcoming features and priority support if applicable.{{/p}}",
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
