import { __ } from '@wordpress/i18n';
import { OmnibarHomeNode } from './omnibar-home';
import { OmnibarNodeList } from './omnibar-node-list';
import { OmnibarResponsiveMenu } from './omnibar-responsive-menu';
import { OmnibarSiteNode } from './omnibar-site';
import { OmnibarUserNode } from './omnibar-user';
import type { OmnibarProps } from '../types';

import './omnibar.scss';

export function Omnibar( { nodes, onClickResponsiveMenu, className }: OmnibarProps ) {
	return (
		<div
			className={ className ? `omnibar ${ className }` : 'omnibar' }
			role="navigation"
			aria-label={ __( 'Toolbar' ) }
		>
			{ onClickResponsiveMenu && (
				<OmnibarResponsiveMenu onClickResponsiveMenu={ onClickResponsiveMenu } />
			) }
			{ nodes.home && <OmnibarHomeNode node={ nodes.home } /> }
			{ nodes.site && <OmnibarSiteNode node={ nodes.site } /> }
			{ nodes.site && nodes.siteNodes && (
				<OmnibarNodeList nodes={ nodes.siteNodes } className="omnibar__site-nodes-item" />
			) }
			<div className="omnibar__secondary">
				{ nodes.userNodes && <OmnibarNodeList nodes={ nodes.userNodes } /> }
				{ nodes.user && <OmnibarUserNode node={ nodes.user } /> }
			</div>
		</div>
	);
}
