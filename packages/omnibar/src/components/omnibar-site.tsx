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

export function OmnibarSiteNode( { node }: { node: OmnibarNode } ) {
	const siteNode = node.title ? { ...node, title: truncateSiteTitle( node.title ) } : node;

	return <OmnibarMenu node={ siteNode } className="omnibar__site" />;
}
