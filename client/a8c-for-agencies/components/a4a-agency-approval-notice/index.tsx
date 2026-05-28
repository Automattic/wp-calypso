import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ApprovalStatus } from 'calypso/state/a8c-for-agencies/types';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { CONTACT_URL_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import type { ReactNode } from 'react';

import './style.scss';

const AGENCY_APPROVAL_DISMISS_PREFERENCE = 'a4a-agency-approval-notice-dismissed';

const A4AAgencyApprovalNotice = ( { isFullWidth }: { isFullWidth?: boolean } ) => {
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

	const availableBannerDetails: Partial<
		Record< ApprovalStatus, { text: ReactNode; level: string; hideCloseButton: boolean } >
	> = {
		[ ApprovalStatus.PENDING ]: {
			text: translate(
				"Welcome to Automattic for Agencies! While we review your agency, feel free to explore. Purchases and referrals will be unlocked once you're approved for the program. Don't worry, we review most applications within a few hours!"
			),
			level: 'warning',
			hideCloseButton: true,
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
			isFullWidth={ isFullWidth }
			level={ bannerDetails.level as 'warning' | 'error' }
			onClose={ dismissNotice }
			hideCloseButton={ bannerDetails.hideCloseButton }
			allowTemporaryDismissal={ bannerDetails.hideCloseButton }
			preferenceName={
				bannerDetails.hideCloseButton ? 'a4a-agency-approval-notice-temporary-dismissed' : undefined
			}
		>
			<div className="a4a-agency-approval-notice__text">{ bannerDetails.text }</div>
		</LayoutBanner>
	);
};

export default A4AAgencyApprovalNotice;
