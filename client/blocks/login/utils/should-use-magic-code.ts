import config from '@automattic/calypso-config';

type ShouldUseMagicCodeProps = {
	/**
	 * Whether the login is for a Jetpack site.
	 */
	isJetpack: boolean;
};

/**
 * Returns true if the login should use magic code.
 * @param {ShouldUseMagicCodeProps} options
 * @returns {boolean}
 */
export function shouldUseMagicCode( { isJetpack }: ShouldUseMagicCodeProps ): boolean {
	const isMagicCodeEnabled = config.isEnabled( 'login/use-magic-code' );

	if ( isJetpack && isMagicCodeEnabled ) {
		return true;
	}

	return false;
}
