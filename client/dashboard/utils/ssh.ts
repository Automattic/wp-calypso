import { SSHKeyTypes } from '@automattic/api-core';

const escapeRegExp = ( value: string ) => value.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

const sshKeyValidation = new RegExp(
	`^(?:${ Object.values( SSHKeyTypes ).map( escapeRegExp ).join( '|' ) })\\s.+`
);

export const isSshKeyValid = ( key: string ) => sshKeyValidation.test( key );
