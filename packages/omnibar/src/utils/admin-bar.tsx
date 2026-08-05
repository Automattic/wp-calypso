import { dispatch } from '@wordpress/data';
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
			case 'wp-logo':
				omnibarNodes.home = omnibarNode;
				omnibarNodes.home.title = undefined;
				break;
			case 'site-name':
				omnibarNodes.site = omnibarNode;
				break;
			case 'new-content': {
				omnibarNode.icon = <span className="dashicons-before dashicons-plus" />;
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'comments': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = undefined;
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-admin-comments" />;
				omnibarNode.meta = {
					subtitle: doc.querySelector( '.pending-count' )?.textContent?.trim(),
				};
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'updates': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = undefined;
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-update" />;
				omnibarNode.meta = {
					subtitle: doc.querySelector( '.ab-label' )?.textContent?.trim(),
				};
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'command-palette': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = undefined;
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-search" />;
				omnibarNode.meta = {
					subtitle: doc.querySelector( 'kbd' )?.textContent?.trim(),
				};
				// The node points at `#` and relies on an inline onclick handler.
				omnibarNode.href = undefined;
				omnibarNode.onClick = () => dispatch( 'core/commands' ).open();
				siteActionNodes.push( omnibarNode );
				break;
			}
			case 'my-account': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				const avatar = doc.querySelector( 'img' );
				const avatarSrc = avatar?.getAttribute( 'src' );
				if ( avatarSrc ) {
					omnibarNode.icon = (
						<img
							src={ avatarSrc }
							srcSet={ avatar?.getAttribute( 'srcset' ) || '' }
							alt={ avatar?.getAttribute( 'alt' ) || '' }
						/>
					);
				}
				omnibarNodes.user = omnibarNode;
				break;
			}
			case 'user-info': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				const avatar = doc.querySelector( 'img' );
				const avatarSrc = avatar?.getAttribute( 'src' );
				if ( avatarSrc ) {
					omnibarNode.icon = (
						<img
							src={ avatarSrc }
							srcSet={ avatar?.getAttribute( 'srcset' ) || '' }
							alt={ avatar?.getAttribute( 'alt' ) || '' }
						/>
					);
				}
				omnibarNode.title = doc.querySelector( '.edit-profile' )?.textContent?.trim() || '';
				omnibarNode.meta = {
					displayName: doc.querySelector( '.display-name' )?.textContent?.trim(),
					username: doc.querySelector( '.username' )?.textContent?.trim(),
				};
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
