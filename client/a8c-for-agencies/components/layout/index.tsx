import classNames from 'classnames';
import React, { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import LayoutColumn from './column';

import './style.scss';

type Props = {
	children: ReactNode;
	sidebarNavigation?: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
	withBorder?: boolean;
	compact?: boolean;
};

export default function Layout( {
	children,
	className,
	title,
	wide,
	withBorder,
	compact,
	sidebarNavigation,
}: Props ) {
	const hasLayoutColumns = React.Children.toArray( children ).some(
		( child ) => React.isValidElement( child ) && child.type === LayoutColumn
	);
	const layoutContainerClassname = hasLayoutColumns
		? 'a4a-layout-with-columns__container'
		: 'a4a-layout__container';

	return (
		<Main
			className={ classNames( 'a4a-layout', className, {
				'is-with-border': withBorder,
				'is-compact': compact,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			{ sidebarNavigation }

			<div className={ layoutContainerClassname }>{ children }</div>
		</Main>
	);
}
