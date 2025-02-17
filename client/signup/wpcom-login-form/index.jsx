import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';

function getFormAction( redirectTo ) {
	const subdomainRegExp = /^https?:\/\/([a-z0-9-]+)\.wordpress\.com(?:$|\/)/;
	const hostname = config( 'hostname' );
	let subdomain = '';

	if (
		subdomainRegExp.test( redirectTo ) &&
		hostname !== 'wpcalypso.wordpress.com' &&
		hostname !== 'horizon.wordpress.com'
	) {
		const subdomainMatch = redirectTo.match( subdomainRegExp );
		if ( subdomainMatch && subdomainMatch[ 1 ] !== 'public-api' ) {
			subdomain = subdomainMatch[ 1 ] + '.';
		}
	}

	return `https://${ subdomain }wordpress.com/wp-login.php`;
}

export default function WpcomLoginForm( { redirectTo, authorization, pwd = '', log } ) {
	const form = useRef();

	useEffect( () => {
		form.current.submit();
	}, [] );

	return (
		<form method="post" action={ getFormAction( redirectTo ) } ref={ form }>
			<input type="hidden" name="log" value={ log } />
			<input type="hidden" name="pwd" value={ pwd } />
			<input type="hidden" name="authorization" value={ authorization } />
			<input type="hidden" name="redirect_to" value={ redirectTo } />
		</form>
	);
}
