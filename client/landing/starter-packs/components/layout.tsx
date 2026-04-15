import { UniversalNavbarHeader, UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import type { ReactNode } from 'react';

interface LayoutProps {
	children: ReactNode;
}

export default function Layout( { children }: LayoutProps ) {
	return (
		<div className="starter-packs-layout">
			<UniversalNavbarHeader variant="minimal" isLoggedIn={ false } />
			<main className="starter-packs__main">{ children }</main>
			<UniversalNavbarFooter />
		</div>
	);
}
