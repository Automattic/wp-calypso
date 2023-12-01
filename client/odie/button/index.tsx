import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import './style.scss'; // Assuming you have a Button.scss file for styles

type ButtonProps = {
	compact?: boolean;
	borderless?: boolean;
	onClick?: () => void;
} & PropsWithChildren;

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
