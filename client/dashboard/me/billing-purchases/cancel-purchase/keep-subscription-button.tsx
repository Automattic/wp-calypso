import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { getButtonLabels } from './get-confirmation-copy';
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

	// Secondary label uses the Cancel intent by default. The primary-button
	// label (Remove vs. Cancel) carries the destructive verb; the secondary is
	// just "Keep {category}", which is the same in either intent.
	const label = getButtonLabels( { purchase, intent: 'cancel' } ).secondary;

	return (
		<Button
			variant="secondary"
			onClick={ () => {
				navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
				onKeepSubscriptionClick();
			} }
		>
			{ label }
		</Button>
	);
}
