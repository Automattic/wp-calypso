import clsx from 'clsx';
import styles from './style.module.scss';
import type { CSSProperties, ReactNode } from 'react';

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
			className={ clsx( styles[ 'step-container-v2__content-row' ], className ) }
			style={ { '--columns': columns } as CSSProperties }
		>
			{ children }
		</div>
	);
};
