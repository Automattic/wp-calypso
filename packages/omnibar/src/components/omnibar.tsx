import { OmnibarHomeNode } from './omnibar-home';
import { OmnibarSiteActionsNode, OmnibarSiteNode } from './omnibar-site';
import { OmnibarUserNode } from './omnibar-user';
import type { OmnibarProps } from '../types';

import './omnibar.scss';

export function Omnibar( { nodes }: OmnibarProps ) {
	return (
		<div className="omnibar" role="navigation" aria-label="Toolbar">
			{ nodes.home && <OmnibarHomeNode node={ nodes.home } /> }
			{ nodes.site && <OmnibarSiteNode node={ nodes.site } /> }
			{ nodes.siteActions && <OmnibarSiteActionsNode nodes={ nodes.siteActions } /> }
			<div className="omnibar__secondary">
				{ nodes.user && <OmnibarUserNode node={ nodes.user } /> }
			</div>
		</div>
	);
}
