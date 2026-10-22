import { __ } from '@wordpress/i18n';
import { OmnibarHomeNode } from './omnibar-home';
import { OmnibarPluginsNode } from './omnibar-plugins';
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
			{ nodes.site && nodes.sitePlugins && (
				<OmnibarPluginsNode nodes={ nodes.sitePlugins } className="omnibar__site-plugin" />
			) }
			<div className="omnibar__secondary">
				{ nodes.userPlugins && <OmnibarPluginsNode nodes={ nodes.userPlugins } /> }
				{ nodes.user && <OmnibarUserNode node={ nodes.user } /> }
			</div>
		</div>
	);
}
