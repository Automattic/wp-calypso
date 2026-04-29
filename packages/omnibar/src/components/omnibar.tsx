import { OmnibarHomeNode } from './omnibar-home';
import { OmnibarResponsiveMenu } from './omnibar-responsive-menu';
import { OmnibarSiteNode } from './omnibar-site';
import { OmnibarUserNode } from './omnibar-user';
import type { OmnibarProps } from '../types';

import './omnibar.scss';

export function Omnibar( { nodes, onClickResponsiveMenu }: OmnibarProps ) {
	return (
		<div className="omnibar" role="navigation" aria-label="Toolbar">
			{ onClickResponsiveMenu && (
				<OmnibarResponsiveMenu onClickResponsiveMenu={ onClickResponsiveMenu } />
			) }
			{ nodes.home && <OmnibarHomeNode node={ nodes.home } /> }
			{ nodes.site && <OmnibarSiteNode node={ nodes.site } actionNodes={ nodes.siteActions } /> }
			<div className="omnibar__secondary">
				{ nodes.user && <OmnibarUserNode node={ nodes.user } /> }
			</div>
		</div>
	);
}
