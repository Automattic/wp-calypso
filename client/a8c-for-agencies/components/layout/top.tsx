import classNames from 'classnames';
import { Children, ReactNode } from 'react';
import LayoutNavigation from './nav';

type Props = {
	children: ReactNode;
	withNavigation?: boolean;
	className?: string;
};

export default function LayoutTop( { children, withNavigation, className }: Props ) {
	const navigation = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutNavigation
	);

	return (
		<div
			className={ classNames( 'a4a-layout__top-wrapper', className, {
				'has-navigation': withNavigation || !! navigation,
			} ) }
		>
			{ children }
		</div>
	);
}
