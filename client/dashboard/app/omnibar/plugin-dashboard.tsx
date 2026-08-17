import { __ } from '@wordpress/i18n';
import { wpcomLink } from '../../utils/link';
import { usesWpAdminInterface } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

export function useDashboardPlugin( {
	site,
	section,
}: {
	site?: Site;
	section?: string;
} ): OmnibarNode | undefined {
	if ( ! site || section === 'sites' ) {
		return undefined;
	}

	if ( usesWpAdminInterface( site ) ) {
		const adminUrl = site.options?.admin_url;
		return adminUrl ? { id: 'dashboard', title: __( 'Dashboard' ), href: adminUrl } : undefined;
	}

	return {
		id: 'my-home',
		title: __( 'My Home' ),
		href: wpcomLink( `/home/${ site.slug }` ),
	};
}

// Add the new node below the view-site node.
export function addDashboardNode( siteNode?: OmnibarNode, dashboardNode?: OmnibarNode ) {
	if ( ! siteNode || ! dashboardNode ) {
		return siteNode;
	}

	const children = [ ...( siteNode.children ?? [] ) ];
	const viewSiteIndex = children.findIndex( ( child ) => child.id === 'view-site' );
	children.splice( viewSiteIndex + 1, 0, dashboardNode );

	return { ...siteNode, children };
}
