import { Button } from '@wordpress/components';
import type { MouseEventHandler, ReactNode } from 'react';

type PrimaryButtonProps = {
	children: ReactNode;
	onClick?: MouseEventHandler< HTMLElement >;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	isBusy?: boolean;
	href?: string;
	target?: string;
	rel?: string;
	className?: string;
	'aria-label'?: string;
};

const fullWidth = { width: '100%' };

const PrimaryButton = ( {
	children,
	onClick,
	type,
	disabled,
	isBusy,
	href,
	target,
	rel,
	className,
	'aria-label': ariaLabel,
}: PrimaryButtonProps ) => {
	if ( href ) {
		return (
			<Button
				variant="primary"
				__next40pxDefaultSize
				style={ fullWidth }
				href={ href }
				target={ target }
				rel={ rel }
				disabled={ disabled }
				className={ className }
				aria-label={ ariaLabel }
				onClick={ onClick }
			>
				{ children }
			</Button>
		);
	}

	return (
		<Button
			variant="primary"
			__next40pxDefaultSize
			style={ fullWidth }
			type={ type }
			disabled={ disabled }
			isBusy={ isBusy }
			className={ className }
			aria-label={ ariaLabel }
			onClick={ onClick }
		>
			{ children }
		</Button>
	);
};

export default PrimaryButton;
