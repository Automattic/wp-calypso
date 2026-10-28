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
} as const;

export type SSHKeyType = ( typeof SSHKeyTypes )[ keyof typeof SSHKeyTypes ];

export interface UserSshKey {
	name: string;
	label: string;
	key: string;
	type: SSHKeyType;
	sha256: string;
	created_at: string;
	updated_at: string;
	site_ids: number[];
}

export interface CreateSshKeyArgs {
	label?: string;
	key: string;
}

export interface UpdateSshKeyArgs {
	name: string;
	key?: string;
	label?: string;
}
