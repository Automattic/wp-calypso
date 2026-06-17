import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { DisplayVariant } from '../../../utils/purchase';
import { getButtonLabels } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface KeepSubscriptionButtonProps {
	purchase: Purchase;
	intent: DisplayVariant;
	onKeepSubscriptionClick: () => void;
}

export default function KeepSubscriptionButton( {
	purchase,
	intent,
	onKeepSubscriptionClick,
}: KeepSubscriptionButtonProps ) {
	const navigate = useNavigate();

	const label = getButtonLabels( { purchase, intent } ).secondary;

	return (
		<Button
			variant="tertiary"
			onClick={ () => {
				navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
				onKeepSubscriptionClick();
			} }
		>
			{ label }
		</Button>
	);
}
