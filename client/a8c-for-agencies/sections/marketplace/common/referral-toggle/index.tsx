import { isEnabled } from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect } from 'react';
import useReferralsGuide from 'calypso/a8c-for-agencies/components/guide-modal/guides/useReferralsGuide';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { ApprovalStatus } from 'calypso/state/a8c-for-agencies/types';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { MarketplaceTypeContext } from '../../context';

import './style.scss';

const PREFERENCE_NAME = 'a4a-marketplace-referral-guide-seen';

const ReferralToggle = () => {
	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );

	const translate = useTranslate();
	const dispatch = useDispatch();
	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );
	const { guideModal, openGuide } = useReferralsGuide();

	const guideModalSeen = useSelector( ( state ) => getPreference( state, PREFERENCE_NAME ) );

	const agency = useSelector( getActiveAgency );

	const isAgencyApproved = agency?.approval_status === ApprovalStatus.APPROVED;

	useEffect( () => {
		if ( marketplaceType === 'referral' && ! guideModalSeen ) {
			dispatch( savePreference( PREFERENCE_NAME, true ) );
			openGuide();
		}
	}, [ dispatch, guideModalSeen, marketplaceType, openGuide ] );

	if ( ! isAutomatedReferrals ) {
		return null;
	}

	return (
		<div className="a4a-marketplace__toggle-marketplace-type">
			{ guideModal }

			<ToggleControl
				onChange={ toggleMarketplaceType }
				checked={ marketplaceType === 'referral' }
				id="a4a-marketplace__toggle-marketplace-type"
				label={ translate( 'Refer products' ) }
				disabled={ ! isAgencyApproved }
			/>

			<Gridicon icon="info-outline" size={ 16 } onClick={ openGuide } />
		</div>
	);
};

export default ReferralToggle;
