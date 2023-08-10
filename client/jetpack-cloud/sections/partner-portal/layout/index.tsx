import classNames from 'classnames';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SidebarNavigation from '../sidebar-navigation';

import './style.scss';

type Props = {
	children: ReactNode;
	className?: string;
	title: ReactNode;
	wide?: boolean;
};

export default function Layout( { children, className, title, wide = false }: Props ) {
	return (
		<Main
			className={ classNames( 'partner-portal-layout', className ) }
			fullWidthLayout={ wide } // Our 'wide' here means maximum of 1500px.
			wideLayout={ ! wide } // When we set to full width, we want to set this to false.
		>
			<DocumentHead title={ title } />
			<SidebarNavigation />

			<div className="partner-portal-layout__container">{ children }</div>
		</Main>
	);
}
