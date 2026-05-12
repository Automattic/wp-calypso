import { Button } from '@wordpress/components';
import type { MouseEventHandler, ReactNode } from 'react';

type LinkButtonProps = {
	children: ReactNode;
	onClick?: MouseEventHandler< HTMLElement >;
	href?: string;
	target?: string;
	rel?: string;
	disabled?: boolean;
	className?: string;
	'aria-label'?: string;
};

const LinkButton = ( {
	children,
	onClick,
	href,
	target,
	rel,
	disabled,
	className,
	'aria-label': ariaLabel,
}: LinkButtonProps ) => {
	if ( href ) {
		return (
			<Button
				variant="link"
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
			variant="link"
			disabled={ disabled }
			className={ className }
			aria-label={ ariaLabel }
			onClick={ onClick }
		>
			{ children }
		</Button>
	);
};

export default LinkButton;
