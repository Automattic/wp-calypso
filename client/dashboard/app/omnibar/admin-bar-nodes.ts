import { dashboardLink, wpcomLink } from '../../utils/link';
import type { AdminBarNode } from '@automattic/omnibar';

function getSubtreeIds( nodes: AdminBarNode[], rootIds: string[] ) {
	const ids = new Set(
		nodes.filter( ( node ) => rootIds.includes( node.id ) ).map( ( { id } ) => id )
	);

	let found = true;
	while ( found ) {
		found = false;
		for ( const node of nodes ) {
			if ( node.parent && ids.has( node.parent ) && ! ids.has( node.id ) ) {
				ids.add( node.id );
				found = true;
			}
		}
	}
	return ids;
}

export function preferDashboardAdminBarNodes(
	dashboardAdminBarNodes: AdminBarNode[] | undefined,
	siteAdminBarNodes: AdminBarNode[] | undefined
) {
	if ( ! dashboardAdminBarNodes || ! siteAdminBarNodes ) {
		return siteAdminBarNodes ?? dashboardAdminBarNodes ?? [];
	}

	const dashboardRootIds = dashboardAdminBarNodes
		.filter( ( node ) => node.id === 'wp-logo' || node.parent === 'top-secondary' )
		.map( ( { id } ) => id );
	const dashboardSubtreeIds = getSubtreeIds( dashboardAdminBarNodes, dashboardRootIds );
	const siteSubtreeIds = getSubtreeIds( siteAdminBarNodes, dashboardRootIds );

	return [
		...siteAdminBarNodes.filter( ( node ) => ! siteSubtreeIds.has( node.id ) ),
		...dashboardAdminBarNodes.filter( ( node ) => dashboardSubtreeIds.has( node.id ) ),
	];
}

export function createHrefResolver( adminUrl?: string ) {
	return ( href: string ) => {
		let url;
		try {
			url = new URL( href, adminUrl );
		} catch {
			return href;
		}

		const path = url.pathname + url.search + url.hash;

		if ( url.host === 'my.wordpress.com' ) {
			return dashboardLink( path );
		}
		if ( url.host === 'wordpress.com' ) {
			return wpcomLink( path );
		}
		return url.href;
	};
}
