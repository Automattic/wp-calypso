type ShouldShowContinueAsUserProps = {
	twoStepNonce?: string;
	socialConnect?: boolean;
	oauth2Client?: object | null;
	isWCCOM?: boolean;
	isBlazePro?: boolean;
	isJetpack?: boolean;
	fromSite?: string;
	twoFactorEnabled?: boolean;
	loginEmailAddress?: string;
	isLoggedIn?: boolean;
};

/**
 * Whether the login block shows "Continue as <user>" instead of the login form. The block and
 * the login page both read it: the page hides the top-bar signup link when the block's footer
 * carries one, and the block drops its footer on the "Continue as" screen.
 */
export default function shouldShowContinueAsUser( {
	twoStepNonce,
	socialConnect,
	oauth2Client,
	isWCCOM,
	isBlazePro,
	isJetpack,
	fromSite,
	twoFactorEnabled,
	loginEmailAddress,
	isLoggedIn,
}: ShouldShowContinueAsUserProps ): boolean {
	return Boolean(
		! twoStepNonce &&
		! socialConnect &&
		// Show the continue as user flow WooCommerce and Blaze Pro but not for other OAuth2 clients
		! ( oauth2Client && ! isWCCOM && ! isBlazePro ) &&
		! isJetpack &&
		! fromSite &&
		! twoFactorEnabled &&
		! loginEmailAddress &&
		isLoggedIn
	);
}
