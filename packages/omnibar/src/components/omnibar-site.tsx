import { Stack } from '@wordpress/ui';
import { OmnibarMenu } from './omnibar-menu';
import type { OmnibarNode } from '../types';

// Core truncates the site title in `wp_admin_bar_site_menu()` with
// `wp_html_excerpt( $blogname, 40, '&hellip;' )`.
const SITE_TITLE_MAX_LENGTH = 40;

function truncateSiteTitle( title: string ) {
	const characters = Array.from( title );
	if ( characters.length <= SITE_TITLE_MAX_LENGTH ) {
		return title;
	}
	return characters.slice( 0, SITE_TITLE_MAX_LENGTH ).join( '' ).trim() + '…';
}

export function OmnibarSiteNode( {
	node,
	pluginNodes,
	actionNodes,
}: {
	node: OmnibarNode;
	pluginNodes?: OmnibarNode[];
	actionNodes?: OmnibarNode[];
} ) {
	const siteNode = node.title ? { ...node, title: truncateSiteTitle( node.title ) } : node;

	return [
		<OmnibarMenu key={ node.id } node={ siteNode } className="omnibar__site" />,
		pluginNodes && <OmnibarSitePluginsNode key="plugins" nodes={ pluginNodes } />,
		actionNodes && <OmnibarSiteActionsNode key="actions" nodes={ actionNodes } />,
	].filter( Boolean );
}

export function OmnibarSitePluginsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => <OmnibarMenu key={ node.id } node={ node } /> );
}

export function OmnibarSiteActionsNode( { nodes }: { nodes: OmnibarNode[] } ) {
	return nodes.map( ( node ) => (
		<OmnibarMenu
			key={ node.id }
			node={ {
				render: ( { icon, title, meta } ) => (
					<Stack direction="row" align="center" className="omnibar__site-action">
						{ icon }
						{ title && <span className="omnibar__label">{ title }</span> }
						{ meta?.subtitle && <span className="omnibar__label">{ meta.subtitle }</span> }
					</Stack>
				),
				...node,
			} }
		/>
	) );
}
