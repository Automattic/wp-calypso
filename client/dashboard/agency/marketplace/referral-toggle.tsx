import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, Button, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useEffect } from 'react';
import { markReferralReveal, ReferralEarnPill, referralTreatment } from './referral-mode-pass';
import { useReferralToggle } from './use-referral-toggle';
import useReferralsGuide from './use-referrals-guide';

// Shared with the classic A4A marketplace so the guide only shows once across dashboards.
const GUIDE_SEEN_PREFERENCE = 'a4a-marketplace-referral-guide-seen';

/** The referral mode switch, named for what the page sells: products by default, or hosting. */
export default function ReferralToggle( {
	label = __( 'Refer to clients' ),
	earn = __( 'Earn up to 50%' ),
}: {
	label?: string;
	/** Option hB: the commission pill beside the switch while referral mode is off. */
	earn?: string;
} ) {
	const { checked, disabled, onChange } = useReferralToggle();
	const { openGuide, guideModal } = useReferralsGuide();

	const { data: guideSeen, isFetched } = useQuery( userPreferenceQuery( GUIDE_SEEN_PREFERENCE ) );
	const { mutate: saveGuideSeen } = useMutation( userPreferenceMutation( GUIDE_SEEN_PREFERENCE ) );

	const treatment = referralTreatment();
	const isPassH = treatment !== 'g';

	useEffect( () => {
		if ( ! isPassH && checked && isFetched && ! guideSeen ) {
			saveGuideSeen( true );
			openGuide();
		}
	}, [ isPassH, checked, isFetched, guideSeen, saveGuideSeen, openGuide ] );

	return (
		<>
			{ guideModal }
			<HStack spacing={ 1 } expanded={ false } alignment="center">
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ checked }
					disabled={ disabled }
					label={ isPassH ? __( 'Refer to clients' ) : label }
					onChange={ ( isOn: boolean ) => {
						if ( isOn ) {
							markReferralReveal();
						}
						onChange( isOn );
					} }
				/>
				{ treatment === 'hb' && ! checked && <ReferralEarnPill>{ earn }</ReferralEarnPill> }
				{ ! isPassH && (
					<Button
						size="small"
						icon={ info }
						label={ __( 'Learn more about product referral mode' ) }
						onClick={ openGuide }
					/>
				) }
			</HStack>
		</>
	);
}
