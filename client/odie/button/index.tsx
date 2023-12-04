import classNames from 'classnames';
import { PropsWithChildren, MouseEvent, PropsWithRef } from 'react';

import './style.scss';

type ButtonProps = {
	compact?: boolean;
	borderless?: boolean;
	onClick?: ( event: MouseEvent ) => void;
} & PropsWithRef< HTMLButtonElement > &
	PropsWithChildren;

const Button = ( { compact, borderless, onClick, children }: ButtonProps ) => {
	const className = classNames( 'odie-button-default', {
		'odie-button-compact': compact,
		'odie-button-borderless': borderless,
	} );

	return (
		<button className={ className } onClick={ onClick }>
			{ children }
		</button>
	);
};

export default Button;
