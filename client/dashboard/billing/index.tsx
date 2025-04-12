import { createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function Billing() {
	return (
		<PageLayout
			title={ __( 'Billing' ) }
			description={ __( 'Manage your billing information and payment methods.' ) }
		/>
	);
}

export const Route = createLazyRoute( 'billing' )( {
	component: Billing,
} );
