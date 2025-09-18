/**
 * List of allowed SSH key formats.
 *
 * We need to keep it in sync with \Openssh_Authorized_Key::VALID_TYPES_AND_BITS from WPCOM.
 */
export const SSHKeyTypes = {
	SSH_RSA: 'ssh-rsa',
	SSH_ED25519: 'ssh-ed25519',
	EC_DSA_SHA2_NISTP256: 'ecdsa-sha2-nistp256',
	EC_DSA_SHA2_NISTP384: 'ecdsa-sha2-nistp384',
	EC_DSA_SHA2_NISTP521: 'ecdsa-sha2-nistp521',
};

export interface UserSshKey {
	name: string;
	key: string;
	type: typeof SSHKeyTypes;
	sha256: string;
	created_at: string;
}

export interface CreateSshKeyArgs {
	name: string;
	key: string;
}
