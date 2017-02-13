/**
 * External dependencies
 */
import React from 'react';
//import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
//import Button from 'components/button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';

const Login = ( { title, children } ) => {
	return (
		<Card className="login">
			<div className="login__header">
				<div className="login__header-title">{ title }</div>
			</div>
			{ children }
			<div className="login__form">
				<label className="login__form-username">
					Username or email <FormTextInput className="login__form-username-input" />
				</label>
				<label className="login__form-username">
					Password <input className="login__form-username-password" type="password" />
				</label>
			</div>
		</Card>
	);
};

Login.propTypes = {
	title: React.PropTypes.string
};

Login.defaultProps = {
	title: ''
};

export default Login;
