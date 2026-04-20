import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';

// Calypso-only deployments that do not serve wp-login.php.
const CALYPSO_ONLY_HOSTNAMES = [
	'wpcalypso.wordpress.com',
	'horizon.wordpress.com',
	'my.wordpress.com',
	'my.woo.ai',
];

// Subdomains of wordpress.com that do not serve wp-login.php.
const EXCLUDED_SUBDOMAINS = [ 'public-api', 'my' ];

function getFormAction( redirectTo ) {
	const subdomainRegExp = /^https?:\/\/([a-z0-9-]+)\.wordpress\.com(?:$|\/)/;
	const hostname = config( 'hostname' );
	let subdomain = '';

	if ( subdomainRegExp.test( redirectTo ) && ! CALYPSO_ONLY_HOSTNAMES.includes( hostname ) ) {
		const subdomainMatch = redirectTo.match( subdomainRegExp );
		if ( subdomainMatch && ! EXCLUDED_SUBDOMAINS.includes( subdomainMatch[ 1 ] ) ) {
			subdomain = subdomainMatch[ 1 ] + '.';
		}
	}

	return `https://${ subdomain }wordpress.com/wp-login.php`;
}

export default function WpcomLoginForm( {
	redirectTo,
	authorization,
	pwd = '',
	log,
	rememberMe = false,
} ) {
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
			{ rememberMe ? <input type="hidden" name="rememberme" value="forever" /> : undefined }
		</form>
	);
}
