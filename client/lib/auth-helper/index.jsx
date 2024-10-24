import config from '@automattic/calypso-config';
import { createRoot } from 'react-dom/client';

import './style.scss';

function AuthHelper() {
	const isOAuth = config.isEnabled( 'oauth' );

	function setAuth( event ) {
		const value = event.currentTarget.value;
		window.location.href = '?' + new URLSearchParams( { flags: value } ).toString();
	}

	return (
		<>
			<div>Auth: { isOAuth ? 'OAuth' : 'Cookies' }</div>
			<div className="auth-helper__popover">
				<label className="auth-helper__label">
					<input
						type="radio"
						name="auth"
						value="-oauth"
						defaultChecked={ ! isOAuth }
						onChange={ setAuth }
					/>
					Cookies
				</label>
				<label className="auth-helper__label">
					<input
						type="radio"
						name="auth"
						value="oauth"
						defaultChecked={ isOAuth }
						onChange={ setAuth }
					/>
					OAuth
				</label>
			</div>
		</>
	);
}

export default ( element ) => createRoot( element ).render( <AuthHelper /> );
