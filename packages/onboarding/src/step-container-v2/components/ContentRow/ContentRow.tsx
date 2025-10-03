import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import './style.scss';

export const ContentRow = ( {
	children,
	columns = 12,
	className,
	stretched,
}: {
	children: ReactNode;
	columns?: number;
	className?: string;
	stretched?: boolean;
} ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__content-row', className, {
				stretched,
			} ) }
			style={ { '--columns': columns } as CSSProperties }
		>
			{ children }
		</div>
	);
};
