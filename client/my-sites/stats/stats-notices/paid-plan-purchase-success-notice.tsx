import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { PaidPlanPurchaseSuccessJetpackStatsNoticeProps } from './types';

const PaidPlanPurchaseSuccessJetpackStatsNotice = ( {
	onNoticeViewed,
}: PaidPlanPurchaseSuccessJetpackStatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	useEffect( () => {
		onNoticeViewed && onNoticeViewed();
	} );

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
					"{{p}}You'll now get instant access to upcoming features and priority support.{{/p}}",
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
