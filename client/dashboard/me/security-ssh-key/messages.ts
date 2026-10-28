import { __ } from '@wordpress/i18n';

export const getSshKeyHelpText = () =>
	__(
		'Paste your SSH public key here. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384 or ecdsa-sha2-nistp521…'
	);

export const getInvalidSshKeyMessage = () =>
	__(
		'Invalid SSH public key. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, or ecdsa-sha2-nistp521.'
	);
