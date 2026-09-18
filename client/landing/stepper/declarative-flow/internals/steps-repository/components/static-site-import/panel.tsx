import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Panel = ( {
	title,
	className,
	children,
}: {
	title?: ReactNode;
	className?: string;
	children: ReactNode;
} ) => (
	<section className={ clsx( 'static-site-import__panel', className ) }>
		{ title && <h2 className="static-site-import__panel-title">{ title }</h2> }
		{ children }
	</section>
);
