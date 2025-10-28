import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { siteDeploymentsListRoute } from '../../app/router/sites';
import SnackbarBackButton from '../../components/snackbar-back-button';
import type { Site } from '@automattic/api-core';

export function BackToDeploymentsButton( { site }: { site: Site } ) {
	const router = useRouter();
	return (
		<SnackbarBackButton
			backUrl={
				router.buildLocation( {
					to: siteDeploymentsListRoute.fullPath,
					params: { siteSlug: site.slug },
				} ).href
			}
		>
			{ __( 'Back to Deployments' ) }
		</SnackbarBackButton>
	);
}
