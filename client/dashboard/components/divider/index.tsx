import clsx from 'clsx';
import type { ComponentProps } from 'react';

import './style.scss';

type DividerProps = ComponentProps< 'hr' > & {
	orientation?: 'horizontal' | 'vertical';
};

export default function Divider( {
	className,
	orientation = 'horizontal',
	...props
}: DividerProps ) {
	const isVertical = orientation === 'vertical';
	return (
		<hr
			className={ clsx( 'dashboard-divider', { 'is-vertical': isVertical }, className ) }
			aria-orientation={ isVertical ? 'vertical' : undefined }
			{ ...props }
		/>
	);
}
