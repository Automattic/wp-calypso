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
} & PropsWithChildren;

const Button = forwardRef< HTMLButtonElement, ButtonProps >(
	( { compact, borderless, onClick, className: externalClassName, children, disabled }, ref ) => {
		const className = clsx( 'odie-button-default', externalClassName, {
			'odie-button-compact': compact,
			'odie-button-borderless': borderless,
		} );

		return (
			<button ref={ ref } className={ className } onClick={ onClick } disabled={ disabled }>
				{ children }
			</button>
		);
	}
);

export default Button;
