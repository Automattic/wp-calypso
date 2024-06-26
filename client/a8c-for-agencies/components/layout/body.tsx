import clsx from 'clsx';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
};

export default function LayoutBody( { children, className }: Props ) {
	const wrapperClass = clsx( className, 'a4a-layout__body' );

	return (
		<div className={ wrapperClass }>
			<div className="a4a-layout__body-wrapper">{ children }</div>
		</div>
	);
}
