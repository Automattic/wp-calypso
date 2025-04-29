import { TextControl } from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef, ForwardedRef } from 'react';

interface LoginUsernameProps {
	isDisabled?: boolean;
	isError?: boolean;
	label: React.ReactNode;
	onChange: ( value: string ) => void;
	value: string;
}

const LoginUsername = forwardRef< HTMLInputElement, LoginUsernameProps >(
	( { isDisabled = false, isError = false, label, onChange, value }, ref ) => {
		return (
			<TextControl
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck="false"
				autoComplete="username"
				className={ clsx( {
					'is-error': isError,
				} ) }
				onChange={ onChange }
				id="usernameOrEmail"
				name="usernameOrEmail"
				ref={ ref as ForwardedRef< HTMLInputElement > }
				value={ value }
				disabled={ isDisabled }
				label={ label }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		);
	}
);

LoginUsername.displayName = 'LoginUsername';

export default LoginUsername;
