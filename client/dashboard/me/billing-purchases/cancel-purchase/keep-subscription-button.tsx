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

	const buttonCopy = ( () => {
		if ( purchase.is_plan ) {
			return __( 'Keep plan' );
		}
		return __( 'Keep product' );
	} )();

	return (
		<Button
			variant="secondary"
			onClick={ () => {
				navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
				onKeepSubscriptionClick();
			} }
		>
			{ buttonCopy }
		</Button>
	);
}
