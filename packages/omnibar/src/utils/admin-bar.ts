import type { AdminBarNode, OmnibarNode, OmnibarNodes } from '../types';

export function buildOmnibarNodesFromAdminBarNodes( adminBarNodes: AdminBarNode[] ): OmnibarNodes {
	const omnibarNodes: OmnibarNodes = {};

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		nodeMap.set( node.id, {
			id: node.id,
			title: node.meta?.menu_title || node.title || '',
			href: node.href,
			group: node.group,
		} );
	}

	for ( const node of adminBarNodes ) {
		const omnibarNode = nodeMap.get( node.id );
		if ( ! omnibarNode ) {
			continue;
		}

		if ( node.parent && node.parent !== 'top-secondary' ) {
			const parentNode = nodeMap.get( node.parent );
			if ( parentNode ) {
				if ( ! parentNode.children ) {
					parentNode.children = [];
				}
				parentNode.children.push( omnibarNode );
			}
		}
	}

	omnibarNodes.home = nodeMap.get( 'wpcom-logo' );
	omnibarNodes.site = nodeMap.get( 'site-name' );
	omnibarNodes.user = nodeMap.get( 'my-account' );

	return omnibarNodes;
}
