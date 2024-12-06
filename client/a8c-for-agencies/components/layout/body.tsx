import clsx from 'clsx';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
	onScroll?: ( e: React.UIEvent< HTMLDivElement > ) => void;
};

export default function LayoutBody( { children, className, onScroll }: Props ) {
	const wrapperClass = clsx( className, 'a4a-layout__body' );

	return (
		<div className={ wrapperClass } onScroll={ onScroll }>
			<div className="a4a-layout__body-wrapper">{ children }</div>
		</div>
	);
}
