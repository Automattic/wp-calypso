import type { AdminBarNode, OmnibarNode, OmnibarNodes } from '../types';

export function buildOmnibarNodesFromAdminBarNodes( adminBarNodes: AdminBarNode[] ): OmnibarNodes {
	const omnibarNodes: OmnibarNodes = {};
	const siteActionNodes: OmnibarNode[] = [];

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		const omnibarNode: OmnibarNode = {
			id: node.id,
			title: node.meta?.menu_title || node.title || '',
			href: node.href,
			group: node.group,
		};

		switch ( node.id ) {
			case 'wpcom-logo':
				omnibarNodes.home = omnibarNode;
				break;
			case 'site-name':
				omnibarNodes.site = omnibarNode;
				break;
			case 'new-content': {
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'comments': {
				omnibarNode.title = 'Comments';
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.meta = {
					subtitle: doc.querySelector( '.pending-count' )?.textContent?.trim(),
				};
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'updates': {
				omnibarNode.title = 'Updates';
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.meta = {
					subtitle: doc.querySelector( '.ab-label' )?.textContent?.trim(),
				};
				siteActionNodes.push( omnibarNode );
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
				omnibarNodes.user = omnibarNode;
				break;
			}
			case 'user-info': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = doc.querySelector( '.edit-profile' )?.textContent?.trim() || '';
				break;
			}
		}

		nodeMap.set( node.id, omnibarNode );
	}

	if ( siteActionNodes.length > 0 ) {
		omnibarNodes.siteActions = siteActionNodes;
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

	return omnibarNodes;
}
