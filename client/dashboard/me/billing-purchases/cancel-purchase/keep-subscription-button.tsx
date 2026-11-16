import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { DisplayVariant } from '../../../utils/purchase';
import { getButtonLabels } from './get-confirmation-copy';
import { useDomainReturnLocation } from './use-domain-return-location';
import type { Purchase } from '@automattic/api-core';

interface KeepSubscriptionButtonProps {
	purchase: Purchase;
	intent: DisplayVariant;
	onKeepSubscriptionClick: () => void;
	disabled?: boolean;
}

export default function KeepSubscriptionButton( {
	purchase,
	intent,
	onKeepSubscriptionClick,
	disabled,
}: KeepSubscriptionButtonProps ) {
	const navigate = useNavigate();
	const domainReturnLocation = useDomainReturnLocation( purchase );

	const label = getButtonLabels( { purchase, intent } ).secondary;

	return (
		<Button
			variant="tertiary"
			disabled={ disabled }
			onClick={ () => {
				if ( domainReturnLocation ) {
					navigate( domainReturnLocation );
				} else {
					navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
				}
				onKeepSubscriptionClick();
			} }
		>
			{ label }
		</Button>
	);
}
