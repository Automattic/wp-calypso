import { isEnabled } from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import useReferralsGuide from 'calypso/a8c-for-agencies/components/guide-modal/guides/useReferralsGuide';
import { MarketplaceTypeContext } from '../../context';

import './style.scss';

const ReferralToggle = () => {
	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const translate = useTranslate();
	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );
	const { guideModal, openGuide } = useReferralsGuide();

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
			/>
			<Gridicon icon="info-outline" size={ 16 } onClick={ openGuide } />
		</div>
	);
};

export default ReferralToggle;
