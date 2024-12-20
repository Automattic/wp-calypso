import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ApprovalStatus } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const AGENCY_APPROVAL_DISMISS_PREFERENCE = 'a4a-agency-approval-notice-dismissed';

const A4AAgencyApprovalNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );

	const dismissNotice = () => {
		dispatch( savePreference( AGENCY_APPROVAL_DISMISS_PREFERENCE, true ) );
		dispatch( recordTracksEvent( 'calypso_a4a_payment_delayed_notice_dismissed' ) );
	};

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, AGENCY_APPROVAL_DISMISS_PREFERENCE )
	);

	if ( isDismissed ) {
		return null;
	}

	const availableBannerDetails = {
		[ ApprovalStatus.PENDING ]: {
			text: translate(
				'Your application to Automattic for Agencies is under review. You won’t be able to make any purchases until you have been approved.'
			),
			level: 'warning',
		},
		[ ApprovalStatus.APPROVED ]: {
			text: translate(
				'Welcome to Automattic for Agencies. Your application has been approved! You can now make purchases in the portal.'
			),
			level: 'success',
			// maybe don't show if signup date is older than x days
		},
		[ ApprovalStatus.REJECTED ]: {
			text: translate(
				'We have not approved your application for the Automattic for Agencies program. Please {{a}}contact support{{/a}} to discuss this further if you think this was done in error.',
				{
					components: {
						a: <a href="#contact-support" />,
					},
				}
			),
			level: 'error',
		},
	};

	if ( ! agency?.approval_status ) {
		return null;
	}

	const bannerDetails = availableBannerDetails[ agency?.approval_status ];

	if ( ! bannerDetails ) {
		return null;
	}

	return (
		<LayoutBanner
			level={ bannerDetails.level as 'warning' | 'success' | 'error' }
			onClose={ dismissNotice }
			className="a4a-payment-delayed-notice"
		>
			<div>{ bannerDetails.text }</div>
		</LayoutBanner>
	);
};

export default A4AAgencyApprovalNotice;
