import type { AdminBarNode, OmnibarNode, OmnibarNodes } from '../types';

export function buildOmnibarNodesFromAdminBarNodes( adminBarNodes: AdminBarNode[] ): OmnibarNodes {
	const omnibarNodes: OmnibarNodes = {};

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		const omnibarNode: OmnibarNode = {
			id: node.id,
			title: node.meta?.menu_title || node.title || '',
			href: node.href,
			group: node.group,
		};

		switch ( node.id ) {
			case 'comments': {
				omnibarNode.title = 'Comments';
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.subtitle = doc.querySelector( '.pending-count' )?.textContent?.trim();
				break;
			}
			case 'updates': {
				omnibarNode.title = 'Updates';
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.subtitle = doc.querySelector( '.ab-label' )?.textContent?.trim();
				break;
			}
			case 'my-account': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				const avatar = doc.querySelector( 'img' );
				const avatarSrc = avatar?.getAttribute( 'src' );
				if ( avatarSrc ) {
					const url = new URL( avatarSrc );
					url.search = '';
					omnibarNode.icon = (
						<img src={ url.toString() } alt={ avatar?.getAttribute( 'alt' ) || '' } />
					);
				}
				break;
			}
		}

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

		switch ( node.id ) {
			case 'wpcom-logo':
				omnibarNodes.home = omnibarNode;
				break;
			case 'site-name':
				omnibarNodes.site = omnibarNode;
				break;
			case 'updates':
			case 'comments':
			case 'new-content':
				if ( ! omnibarNodes.siteActions ) {
					omnibarNodes.siteActions = [];
				}
				omnibarNodes.siteActions.push( omnibarNode );
				break;
			case 'my-account':
				omnibarNodes.user = omnibarNode;
				break;
		}
	}

	return omnibarNodes;
}
