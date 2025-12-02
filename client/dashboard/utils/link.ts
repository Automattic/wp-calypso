import config from '@automattic/calypso-config';

export function wpcomLink( path: string ) {
	return `${ config( 'wpcom_url' ) }${ path }`;
}
