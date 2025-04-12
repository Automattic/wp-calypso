import { createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function SiteDeployments() {
	return <PageLayout title={ __( 'Deployments' ) } />;
}

export const Route = createLazyRoute( 'deployments' )( {
	component: SiteDeployments,
} );
