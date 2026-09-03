import { dispatch } from '@wordpress/data';
import type {
	AdminBarNode,
	OmnibarHrefResolver,
	OmnibarNode,
	OmnibarNodeBuilders,
	OmnibarNodes,
} from '../types';

export function buildOmnibarNodesFromAdminBarNodes(
	adminBarNodes: AdminBarNode[],
	builders?: OmnibarNodeBuilders,
	resolveHref?: OmnibarHrefResolver
): OmnibarNodes {
	const omnibarNodes: OmnibarNodes = {};
	const siteActionNodes: OmnibarNode[] = [];
	const pluginNodes: OmnibarNode[] = [];

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		const omnibarNode: OmnibarNode = {
			id: node.id,
			title: node.meta?.menu_title || node.title || '',
			href: node.href && resolveHref ? resolveHref( node.href ) : node.href,
			group: node.group,
		};

		if ( node.meta?.class?.split( ' ' ).includes( 'ab-sub-secondary' ) ) {
			omnibarNode.variant = 'secondary';
		}

		switch ( node.id ) {
			case 'wp-logo':
				omnibarNodes.home = omnibarNode;
				omnibarNodes.home.title = undefined;
				break;
			case 'site-name': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				const siteIcon = doc.querySelector( 'img' );
				const siteIconSrc = siteIcon?.getAttribute( 'src' );
				omnibarNode.icon = siteIconSrc ? (
					<img
						className="omnibar__site-icon"
						src={ siteIconSrc }
						srcSet={ siteIcon?.getAttribute( 'srcset' ) || '' }
						alt={ siteIcon?.getAttribute( 'alt' ) || '' }
					/>
				) : (
					<span className="dashicons-before dashicons-admin-home" />
				);
				omnibarNodes.site = omnibarNode;
				break;
			}
			case 'new-content': {
				omnibarNode.icon = <span className="dashicons-before dashicons-plus" />;
				omnibarNode.className = 'omnibar__new-content';
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
				omnibarNode.className = 'omnibar__updates';
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
				omnibarNode.onClick = () => ( dispatch( 'core/commands' ) as { open: () => void } ).open();
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

		const builder = builders?.[ node.id ];
		if ( builder ) {
			Object.assign( omnibarNode, builder( node ) );

			// The tree walk skips `top-secondary`, so a builder is what surfaces those nodes.
			if ( node.parent === 'top-secondary' ) {
				pluginNodes.push( omnibarNode );
			}
		}

		nodeMap.set( node.id, omnibarNode );
	}

	if ( siteActionNodes.length > 0 ) {
		omnibarNodes.siteActions = siteActionNodes;
	}

	if ( pluginNodes.length > 0 ) {
		omnibarNodes.plugins = pluginNodes;
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
