import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import useReferralsGuide from 'calypso/a8c-for-agencies/components/guide-modal/guides/useReferralsGuide';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { MarketplaceTypeContext } from '../../context';

import './style.scss';

const PREFERENCE_NAME = 'a4a-marketplace-referral-guide-seen';

const ReferralToggle = () => {
	const isAutomatedReferrals = isEnabled( 'a4a-automated-referrals' );
	const { data: tipaltiData } = useGetTipaltiPayee( true );
	const isPayable = tipaltiData?.IsPayable;

	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLSpanElement | null >( null );

	const translate = useTranslate();
	const dispatch = useDispatch();
	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );
	const { guideModal, openGuide } = useReferralsGuide();

	const guideModalSeen = useSelector( ( state ) => getPreference( state, PREFERENCE_NAME ) );
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
			<span
				onMouseEnter={ () => ! isPayable && setShowPopover( true ) }
				role="button"
				tabIndex={ 0 }
				ref={ wrapperRef }
			>
				<ToggleControl
					disabled={ ! isPayable }
					onChange={ toggleMarketplaceType }
					checked={ marketplaceType === 'referral' }
					id="a4a-marketplace__toggle-marketplace-type"
					label={ translate( 'Refer products' ) }
				/>
				{ showPopover && (
					<A4APopover
						className="referral-toggle__notice"
						title={ translate( 'Your payment settings require action' ) }
						offset={ 12 }
						wrapperRef={ wrapperRef }
						onFocusOutside={ () => setShowPopover( false ) }
					>
						<div className="referral-toggle__notice-description">
							{ translate(
								'Please confirm your details before referring products to your clients.'
							) }
						</div>
						<Button className="is-dark" href="/referrals/payment-settings">
							{ translate( 'Go to payment settings' ) }
						</Button>
					</A4APopover>
				) }
			</span>
			<Gridicon icon="info-outline" size={ 16 } onClick={ openGuide } />
		</div>
	);
};

export default ReferralToggle;
