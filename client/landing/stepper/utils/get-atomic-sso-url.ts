type Props = {
	siteSlug: string;
	redirectTo?: string;
};

export const getAtomicSSOUrl = ( { siteSlug, redirectTo }: Props ): string => {
	const stagingUrl = siteSlug.replace( '.wordpress.com', '.wpcomstaging.com' );

	if ( redirectTo ) {
		const encodedRedirectTo = encodeURIComponent( redirectTo );
		return `https://${ stagingUrl }/wp-login.php?action=jetpack-sso&redirect_to=${ encodedRedirectTo }`;
	}

	return `https://${ stagingUrl }/wp-login.php?action=jetpack-sso`;
};
