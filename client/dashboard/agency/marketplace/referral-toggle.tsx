import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useEffect } from 'react';
import { useReferralToggle } from './use-referral-toggle';
import useReferralsGuide from './use-referrals-guide';

// Shared with the classic A4A marketplace so the guide only shows once across dashboards.
const GUIDE_SEEN_PREFERENCE = 'a4a-marketplace-referral-guide-seen';

export default function ReferralToggle() {
	const { checked, disabled, onChange } = useReferralToggle();
	const { openGuide, guideModal } = useReferralsGuide();

	const { data: guideSeen, isFetched } = useQuery( userPreferenceQuery( GUIDE_SEEN_PREFERENCE ) );
	const { mutate: saveGuideSeen } = useMutation( userPreferenceMutation( GUIDE_SEEN_PREFERENCE ) );

	useEffect( () => {
		if ( checked && isFetched && ! guideSeen ) {
			saveGuideSeen( true );
			openGuide();
		}
	}, [ checked, isFetched, guideSeen, saveGuideSeen, openGuide ] );

	return (
		<>
			{ guideModal }
			<HStack spacing={ 1 } expanded={ false } alignment="center">
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ checked }
					disabled={ disabled }
					label={ __( 'Refer products' ) }
					onChange={ onChange }
				/>
				<Button
					size="small"
					icon={ info }
					label={ __( 'Learn more about product referral mode' ) }
					onClick={ openGuide }
				/>
			</HStack>
		</>
	);
}
