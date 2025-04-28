import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import './style.scss';

export const ContentRow = ( {
	children,
	columns = 12,
	className,
}: {
	children: ReactNode;
	columns?: number;
	className?: string;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-row', className ) }
			style={ { '--columns': columns } as CSSProperties }
		>
			{ children }
		</div>
	);
};
