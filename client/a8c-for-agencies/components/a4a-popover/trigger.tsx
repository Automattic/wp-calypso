import clsx from 'clsx';
import { forwardRef } from 'react';

import './style.scss';

interface Props extends Omit< React.HTMLAttributes< HTMLSpanElement >, 'role' | 'tabIndex' > {
	onActivate: () => void;
	className?: string;
	children: React.ReactNode;
}

const A4APopoverTrigger = forwardRef< HTMLSpanElement, Props >( function A4APopoverTrigger(
	{ onActivate, className, children, onClick, onKeyDown, ...rest },
	ref
) {
	const handleClick = ( event: React.MouseEvent< HTMLSpanElement > ) => {
		onClick?.( event );
		onActivate();
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLSpanElement > ) => {
		onKeyDown?.( event );
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			onActivate();
		}
	};

	return (
		<span
			{ ...rest }
			ref={ ref }
			className={ clsx( 'a4a-popover-trigger', className ) }
			role="button"
			tabIndex={ 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
		>
			{ children }
		</span>
	);
} );

export default A4APopoverTrigger;
