import { SSHKeyTypes } from '@automattic/api-core';

export const MAX_SSH_KEYS = 10;

export const SSH_KEY_LABEL_MAX_LENGTH = 50;

const sshKeyValidation = new RegExp( `^(?:${ Object.values( SSHKeyTypes ).join( '|' ) })\\s.+` );

export const isSshKeyValid = ( key: string ) => sshKeyValidation.test( key );

/**
 * Returns the comment at the end of a public key (for example `user@host`), cut to the label
 * length limit. The server drops the comment when it stores the key, so only the UI can read it.
 */
export const getSshKeyComment = ( key: string ) => {
	const trimmedKey = key.trim();
	if ( ! isSshKeyValid( trimmedKey ) ) {
		return '';
	}
	return trimmedKey
		.split( /\s+/ )
		.slice( 2 )
		.join( ' ' )
		.slice( 0, SSH_KEY_LABEL_MAX_LENGTH )
		.trim();
};
