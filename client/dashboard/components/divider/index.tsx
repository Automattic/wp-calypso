import clsx from 'clsx';
import type { ComponentProps } from 'react';

import './style.scss';

export default function Divider( { className, ...props }: ComponentProps< 'hr' > ) {
	return <hr className={ clsx( 'dashboard-divider', className ) } { ...props } />;
}
