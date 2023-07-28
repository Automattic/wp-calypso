import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

const PaidPlanPurchaseSuccessJetpackStatsNotice = () => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const dismissNotice = () => {
		// TODO: Remove the query string from the window URL without a refresh.
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
