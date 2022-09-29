import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';

function getFormAction( redirectTo ) {
	const subdomainRegExp = /^https?:\/\/([a-z0-9]+)\.wordpress\.com(?:$|\/)/;
	const hostname = config( 'hostname' );
	let subdomain = '';

	if (
		subdomainRegExp.test( redirectTo ) &&
		hostname !== 'wpcalypso.wordpress.com' &&
		hostname !== 'horizon.wordpress.com'
	) {
		subdomain = redirectTo.match( subdomainRegExp )[ 1 ] + '.';
	}

	return `https://${ subdomain }wordpress.com/wp-login.php`;
}

export default function WpcomLoginForm( { extraFields, redirectTo, authorization, pwd, log } ) {
	const form = useRef();

	useEffect( () => {
		form.current.submit();
	}, [] );

	function renderExtraFields() {
		if ( ! extraFields ) {
			return null;
		}

		return Object.entries( extraFields ).map( ( [ field, value ] ) => (
			<input key={ field } type="hidden" name={ field } value={ value } />
		) );
	}

	return (
		<form method="post" action={ getFormAction( redirectTo ) } ref={ form }>
			<input type="hidden" name="log" value={ log } />
			<input type="hidden" name="pwd" value={ pwd } />
			<input type="hidden" name="authorization" value={ authorization } />
			<input type="hidden" name="redirect_to" value={ redirectTo } />
			{ renderExtraFields() }
		</form>
	);
}
