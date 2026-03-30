import { ssoAuthorize } from '@automattic/api-core';
import { useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useState } from 'react';
import { TextSkeleton } from '../../components/text-skeleton';

function validateSsoUrl( raw: string ): URL {
	const url = new URL( raw );
	if ( url.protocol !== 'https:' ) {
		throw new Error( 'Received invalid SSO redirect URL' );
	}
	return url;
}

export default function SsoBridge() {
	const { site_id: siteId, sso_nonce: ssoNonce } = useSearch( { from: '/sso-bridge' } );
	const [ error, setError ] = useState< Error >();

	useEffect( () => {
		if ( ! siteId || ! ssoNonce ) {
			return;
		}

		let cancelled = false;

		ssoAuthorize( Number( siteId ), ssoNonce )
			.then( ( data ) => {
				if ( cancelled ) {
					return;
				}
				const ssoUrl = validateSsoUrl( data.sso_url );
				window.location.replace( ssoUrl.toString() );
			} )
			.catch( ( err: unknown ) => {
				if ( cancelled ) {
					return;
				}
				setError( err instanceof Error ? err : new Error( 'SSO authorization failed' ) );
			} );

		return () => {
			cancelled = true;
		};
	}, [ siteId, ssoNonce ] );

	if ( error ) {
		throw error;
	}

	return (
		<VStack alignment="center" justify="center" style={ { minHeight: '60vh' } }>
			<TextSkeleton length={ 30 } />
		</VStack>
	);
}
