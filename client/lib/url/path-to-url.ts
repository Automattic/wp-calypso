import config from '@automattic/calypso-config';

export function pathToUrl( path: string ) {
	if ( config( 'env' ) !== 'production' ) {
		const protocol = config( 'protocol' ) ?? 'https';
		const port = config( 'port' ) ? ':' + config( 'port' ) : '';
		const hostName = config( 'hostname' );

		return `${ protocol }://${ hostName }${ port }${ path }`;
	}

	return `https://${ config( 'hostname' ) }${ path }`;
}
