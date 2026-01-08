import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { purchaseSettingsRoute } from '../../../app/router/me';
import type { Purchase } from '@automattic/api-core';

interface KeepSubscriptionButtonProps {
	purchase: Purchase;
	onKeepSubscriptionClick: () => void;
}

export default function KeepSubscriptionButton( {
	purchase,
	onKeepSubscriptionClick,
}: KeepSubscriptionButtonProps ) {
	const navigate = useNavigate();

	return (
		<Button
			variant="secondary"
			onClick={ () => {
				navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
				onKeepSubscriptionClick();
			} }
		>
			{ purchase.is_plan ? __( 'Keep plan' ) : __( 'Keep product' ) }
		</Button>
	);
}
