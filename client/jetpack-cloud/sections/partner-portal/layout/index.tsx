import classNames from 'classnames';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from '../sidebar-navigation';

import './style.scss';

type Props = {
	children: ReactNode;
	className?: string;
	fullWidth?: boolean;
	title: ReactNode;
	wide?: boolean;
};

export default function Layout( {
	children,
	className,
	fullWidth = false,
	title,
	wide = false,
}: Props ) {
	return (
		<Main
			className={ classNames( 'partner-portal-layout', className ) }
			fullWidthLayout={ fullWidth }
			wideLayout={ wide }
		>
			<DocumentHead title={ title } />
			<SidebarNavigation />

			<div className="partner-portal-layout__container">{ children }</div>
		</Main>
	);
}
