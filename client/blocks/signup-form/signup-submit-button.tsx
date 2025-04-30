import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface SignupSubmitButtonProps {
	isBusy?: boolean;
	isDisabled?: boolean;
	variationName?: string;
	children: ReactNode;
	className?: string;
}

const SignupSubmitButton = ( {
	isBusy = false,
	isDisabled = false,
	variationName,
	children,
	className,
}: SignupSubmitButtonProps ) => {
	return (
		<Button
			variant="primary"
			type="submit"
			className={ clsx(
				'signup-form__submit',
				className,
				variationName && `${ variationName }-signup-form`
			) }
			disabled={ isDisabled }
			isBusy={ isBusy }
			__next40pxDefaultSize
		>
			{ children }
		</Button>
	);
};

export default SignupSubmitButton;
