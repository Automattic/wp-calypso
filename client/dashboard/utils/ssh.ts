import { SSHKeyTypes } from '@automattic/api-core';

const sshKeyValidation = new RegExp( `^(?:${ Object.values( SSHKeyTypes ).join( '|' ) })\\s.+` );

export const isSshKeyValid = ( key: string ) => sshKeyValidation.test( key );
