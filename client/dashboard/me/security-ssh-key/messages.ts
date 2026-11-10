import { __ } from '@wordpress/i18n';

export const getSshKeyHelpText = () =>
	__(
		'Paste your SSH public key here. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, ecdsa-sha2-nistp521 or sk-ssh-ed25519@openssh.com…'
	);

export const getInvalidSshKeyMessage = () =>
	__(
		'Invalid SSH public key. It should begin with ssh-rsa, ssh-ed25519, ecdsa-sha2-nistp256, ecdsa-sha2-nistp384, ecdsa-sha2-nistp521, or sk-ssh-ed25519@openssh.com.'
	);
