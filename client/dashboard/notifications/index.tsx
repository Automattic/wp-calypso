import { createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function Notifications() {
	return (
		<PageLayout
			title={ __( 'Notifications' ) }
			description={ __( 'Manage your notification settings.' ) }
		/>
	);
}

export const Route = createLazyRoute( 'notifications' )( {
	component: Notifications,
} );
