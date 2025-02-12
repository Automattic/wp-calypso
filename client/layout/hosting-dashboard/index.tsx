import clsx from 'clsx';
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
	onScroll?: ( e: React.UIEvent< HTMLDivElement > ) => void;
};

export default function Layout( {
	children,
	className,
	title,
	wide,
	withBorder,
	sidebarNavigation,
	onScroll,
}: Props ) {
	const hasLayoutColumns = React.Children.toArray( children ).some(
		( child ) => React.isValidElement( child ) && child.type === LayoutColumn
	);
	const layoutContainerClassname = hasLayoutColumns
		? 'hosting-dashboard-layout-with-columns__container'
		: 'hosting-dashboard-layout__container';

	return (
		<Main
			className={ clsx( 'hosting-dashboard-layout', className, {
				'is-with-border': withBorder,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			{ sidebarNavigation }

			<div className={ layoutContainerClassname } onScroll={ onScroll }>
				{ children }
			</div>
		</Main>
	);
}
