import type { AdminBarNode, OmnibarNode, OmnibarNodes } from '../types';

function parseAdminBarNodeTitle( omnibarNode: OmnibarNode, adminBarNode: AdminBarNode ) {
	if ( adminBarNode.id === 'comments' ) {
		omnibarNode.title = 'Comments';
		const doc = new DOMParser().parseFromString( adminBarNode.title || '', 'text/html' );
		omnibarNode.subtitle = doc.querySelector( '.pending-count' )?.textContent?.trim();
	} else if ( adminBarNode.id === 'updates' ) {
		omnibarNode.title = 'Updates';
		const doc = new DOMParser().parseFromString( adminBarNode.title || '', 'text/html' );
		omnibarNode.subtitle = doc.querySelector( '.ab-label' )?.textContent?.trim();
	} else {
		omnibarNode.title = adminBarNode.meta?.menu_title || adminBarNode.title || omnibarNode.title;
	}
}

export function buildOmnibarNodesFromAdminBarNodes( adminBarNodes: AdminBarNode[] ): OmnibarNodes {
	const omnibarNodes: OmnibarNodes = {};

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		const omnibarNode = {
			id: node.id,
			title: '',
			href: node.href,
			group: node.group,
		};
		parseAdminBarNodeTitle( omnibarNode, node );
		nodeMap.set( node.id, omnibarNode );
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

		if ( node.id === 'wpcom-logo' ) {
			omnibarNodes.home = omnibarNode;
		} else if ( node.id === 'site-name' ) {
			omnibarNodes.site = omnibarNode;
		} else if ( [ 'updates', 'comments', 'new-content' ].includes( node.id ) ) {
			if ( ! omnibarNodes.siteActions ) {
				omnibarNodes.siteActions = [];
			}
			omnibarNodes.siteActions.push( omnibarNode );
		} else if ( node.id === 'my-account' ) {
			omnibarNodes.user = omnibarNode;
		}
	}

	return omnibarNodes;
}
