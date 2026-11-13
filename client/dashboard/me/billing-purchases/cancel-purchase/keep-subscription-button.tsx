import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { domainRoute } from '../../../app/router/domains';
import { purchaseSettingsRoute } from '../../../app/router/me';
import { DisplayVariant } from '../../../utils/purchase';
import { getButtonLabels } from './get-confirmation-copy';
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
	const { back_to: backTo } = useSearch( { strict: false } );

	const label = getButtonLabels( { purchase, intent } ).secondary;

	return (
		<Button
			variant="tertiary"
			disabled={ disabled }
			onClick={ () => {
				if ( backTo === 'domain' && purchase.is_domain_registration ) {
					navigate( { to: domainRoute.fullPath, params: { domainName: purchase.meta } } );
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
