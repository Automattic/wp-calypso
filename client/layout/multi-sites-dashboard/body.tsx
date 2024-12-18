import clsx from 'clsx';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
};

export default function LayoutBody( { children, className }: Props ) {
	const wrapperClass = clsx( className, 'multi-sites-dashboard-layout__body' );

	return (
		<div className={ wrapperClass }>
			<div className="multi-sites-dashboard-layout__body-wrapper">{ children }</div>
		</div>
	);
}
