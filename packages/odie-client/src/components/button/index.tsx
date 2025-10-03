import clsx from 'clsx';
import { PropsWithChildren, MouseEvent, forwardRef } from 'react';

import './style.scss';

type ButtonProps = {
	compact?: boolean;
	borderless?: boolean;
	onClick?: ( event: MouseEvent ) => void;
	title?: string;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
} & PropsWithChildren;

const Button = forwardRef< HTMLButtonElement, ButtonProps >(
	(
		{ compact, borderless, onClick, className: externalClassName, children, disabled, ariaLabel },
		ref
	) => {
		const className = clsx( 'odie-button-default', externalClassName, {
			'odie-button-compact': compact,
			'odie-button-borderless': borderless,
		} );

		return (
			<button
				ref={ ref }
				className={ className }
				onClick={ onClick }
				disabled={ disabled }
				aria-label={ ariaLabel }
			>
				{ children }
			</button>
		);
	}
);

Button.displayName = 'Button';

export default Button;
