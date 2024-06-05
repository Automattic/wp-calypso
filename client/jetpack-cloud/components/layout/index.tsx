import clsx from 'clsx';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

import './style.scss';

type Props = {
	children: ReactNode;
	sidebarNavigation?: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
	withBorder?: boolean;
};

export default function Layout( {
	children,
	className,
	title,
	wide = false,
	withBorder = false,
	sidebarNavigation,
}: Props ) {
	return (
		<Main
			className={ clsx( 'jetpack-cloud-layout', className, {
				'is-with-border': withBorder,
			} ) }
			fullWidthLayout={ wide }
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			{ sidebarNavigation }

			<div className="jetpack-cloud-layout__container">{ children }</div>
		</Main>
	);
}
