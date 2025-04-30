import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface SignupSubmitButtonProps {
	isBusy?: boolean;
	isDisabled?: boolean;
	variationName?: string;
	children: ReactNode;
}

const SignupSubmitButton = ( {
	isBusy = false,
	isDisabled = false,
	variationName,
	children,
}: SignupSubmitButtonProps ) => {
	return (
		<Button
			variant="primary"
			type="submit"
			className={ clsx( 'signup-form__submit', variationName && `${ variationName }-signup-form` ) }
			disabled={ isDisabled }
			__next40pxDefaultSize
			isBusy={ isBusy }
		>
			{ children }
		</Button>
	);
};

export default SignupSubmitButton;
