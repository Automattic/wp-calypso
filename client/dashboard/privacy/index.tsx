import { createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function Privacy() {
	return (
		<PageLayout title={ __( 'Privacy' ) } description={ __( 'Manage your privacy settings.' ) } />
	);
}

export const Route = createLazyRoute( 'privacy' )( {
	component: Privacy,
} );
