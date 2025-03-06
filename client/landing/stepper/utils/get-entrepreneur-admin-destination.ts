import { getAtomicSSOUrl } from './get-atomic-sso-url';

type Props = {
	siteSlug: string;
};

export const getEntrepreneurAdminDestination = ( { siteSlug }: Props ): string => {
	const stagingUrl = siteSlug.replace( '.wordpress.com', '.wpcomstaging.com' );

	// Redirect users to the login page with the 'action=jetpack-sso' parameter to initiate Jetpack SSO login and redirect them to Woo CYS's Design With AI after.
	// This URL, however, is just symbolic because somewhere within Jetpack SSO or some plugin is stripping off the `redirect_to` param.
	// The actual work that is doing the redirection is in wpcomsh/1801
	const redirectTo = `https://${ stagingUrl }/wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=entrepreneur-signup`;

	return getAtomicSSOUrl( { siteSlug, redirectTo } );
};
