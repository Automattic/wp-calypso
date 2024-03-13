import classNames from 'classnames';
import { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
};

export default function LayoutBody( { children, className }: Props ) {
	return (
		<div className={ classNames( 'a4a-layout__body', className ) }>
			<div className="a4a-layout__body-wrapper">{ children }</div>
		</div>
	);
}
