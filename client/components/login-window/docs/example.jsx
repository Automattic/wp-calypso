import { Button } from '@wordpress/components';
import LoginWindow from 'calypso/components/login-window';

const LoginWindowExample = () => {
	const { login } = LoginWindow( {
		onLoginSuccess: () => window.location.reload(),
	} );
	return (
		<div className="design-assets__group">
			<div className="login-window__social-buttons">
				<Button isLink onClick={ login }>
					Log in
				</Button>
			</div>
		</div>
	);
};

export default LoginWindowExample;
