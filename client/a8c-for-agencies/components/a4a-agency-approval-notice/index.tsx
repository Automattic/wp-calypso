import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ApprovalStatus } from 'calypso/state/a8c-for-agencies/types';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { CONTACT_URL_HASH_FRAGMENT } from '../a4a-contact-support-widget';

import './style.scss';

const AGENCY_APPROVAL_DISMISS_PREFERENCE = 'a4a-agency-approval-notice-dismissed';

const A4AAgencyApprovalNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );

	const dismissNotice = () => {
		dispatch( savePreference( AGENCY_APPROVAL_DISMISS_PREFERENCE, true ) );
	};

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, AGENCY_APPROVAL_DISMISS_PREFERENCE )
	);

	if ( isDismissed ) {
		return null;
	}

	// If approved, only show banner for 1 week after signup
	if (
		agency?.approval_status === ApprovalStatus.APPROVED &&
		agency?.created_at &&
		new Date( agency.created_at ) < new Date( Date.now() - 7 * 24 * 60 * 60 * 1000 ) // 7 days
	) {
		return null;
	}

	const availableBannerDetails = {
		[ ApprovalStatus.PENDING ]: {
			text: translate(
				"Welcome to Automattic for Agencies! While we review your agency, feel free to explore. Purchases and referrals will be unlocked once you're approved for the program. Don't worry, we review most applications within a few hours!"
			),
			level: 'warning',
			hideCloseButton: true,
		},
		[ ApprovalStatus.APPROVED ]: {
			text: translate(
				'Welcome to Automattic for Agencies. Your application has been approved! You can now make purchases in the portal.'
			),
			level: 'success',
			hideCloseButton: false,
		},
		[ ApprovalStatus.REJECTED ]: {
			text: translate(
				'We have not approved your application for the Automattic for Agencies program. Please {{a}}contact support{{/a}} to discuss this further if you think this was done in error.',
				{
					components: {
						a: <a href={ CONTACT_URL_HASH_FRAGMENT } />,
					},
				}
			),
			level: 'error',
			hideCloseButton: true,
		},
	};

	const bannerDetails = agency?.approval_status
		? availableBannerDetails[ agency.approval_status ]
		: null;

	if ( ! bannerDetails ) {
		return null;
	}

	return (
		<LayoutBanner
			level={ bannerDetails.level as 'warning' | 'success' | 'error' }
			onClose={ dismissNotice }
			className="a4a-agency-approval-notice"
			hideCloseButton={ bannerDetails.hideCloseButton }
		>
			<div className="a4a-agency-approval-notice__text">{ bannerDetails.text }</div>
		</LayoutBanner>
	);
};

export default A4AAgencyApprovalNotice;
