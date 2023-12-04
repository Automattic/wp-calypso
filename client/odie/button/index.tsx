import classNames from 'classnames';
import { PropsWithChildren, MouseEvent, Ref } from 'react';

import './style.scss';

type ButtonProps = {
	compact?: boolean;
	borderless?: boolean;
	onClick?: ( event: MouseEvent ) => void;
	ref?: Ref< HTMLButtonElement >;
	title?: string;
	disabled?: boolean;
	className?: string;
} & PropsWithChildren;

const Button = ( {
	compact,
	borderless,
	onClick,
	className: externalClassName,
	children,
	disabled,
}: ButtonProps ) => {
	const className = classNames( 'odie-button-default', externalClassName, {
		'odie-button-compact': compact,
		'odie-button-borderless': borderless,
	} );

	return (
		<button className={ className } onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	);
};

export default Button;
