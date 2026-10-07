import { activeAgencyQuery, referralsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, ToggleControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useReferralToggle } from './use-referral-toggle';

export default function ReferralToggle( { kind }: { kind: 'products' | 'hosting' } ) {
	const { checked, disabled, onChange } = useReferralToggle();

	const { data: agency } = useQuery( activeAgencyQuery() );
	const { data: referrals } = useQuery( referralsQuery( agency?.id ?? 0 ) );
	const isMobile = useViewportMatch( 'mobile', '<' );
	// Shown until the agency's first referral, in both modes, so the header doesn't shift on toggle.
	// Phones have no room for it beside the switch.
	const showEarnings = ! isMobile && referrals?.length === 0;

	return (
		<HStack spacing={ 2 } expanded={ false } alignment="center">
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ checked }
				disabled={ disabled }
				label={ __( 'Refer to clients' ) }
				onChange={ onChange }
			/>
			{ showEarnings && (
				<Badge intent="informational">
					{ kind === 'hosting' ? __( 'Earn 20%' ) : __( 'Earn up to 50%' ) }
				</Badge>
			) }
		</HStack>
	);
}
