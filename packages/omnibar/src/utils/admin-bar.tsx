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
	const siteNodes: OmnibarNode[] = [];
	const userNodes: OmnibarNode[] = [];

	const nodeMap = new Map< string, OmnibarNode >();
	for ( const node of adminBarNodes ) {
		const builder = builders?.[ node.id ];
		const built = builder?.( node );
		if ( built === null ) {
			continue;
		}

		const omnibarNode: OmnibarNode = {
			id: node.id,
			title: node.meta?.menu_title || node.title || '',
			tooltip: node.meta?.title || undefined,
			href: node.href && resolveHref ? resolveHref( node.href ) : node.href,
			group: node.group,
		};

		if ( node.meta?.class?.split( ' ' ).includes( 'ab-sub-secondary' ) ) {
			omnibarNode.variant = 'secondary';
		}

		switch ( node.id ) {
			case 'wp-logo': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = undefined;
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNodes.home = omnibarNode;
				break;
			}
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
				break;
			}
			case 'comments': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = doc.querySelector( '.pending-count' )?.textContent?.trim();
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-admin-comments" />;
				break;
			}
			case 'updates': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = doc.querySelector( '.ab-label' )?.textContent?.trim();
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-update" />;
				omnibarNode.className = 'omnibar__updates';
				break;
			}
			case 'command-palette': {
				const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
				omnibarNode.title = doc.querySelector( 'kbd' )?.textContent?.trim();
				omnibarNode.label = doc.querySelector( '.screen-reader-text' )?.textContent?.trim();
				omnibarNode.icon = <span className="dashicons-before dashicons-search" />;
				// The node points at `#` and relies on an inline onclick handler.
				omnibarNode.href = undefined;
				omnibarNode.onClick = () => ( dispatch( 'core/commands' ) as { open: () => void } ).open();
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

		if ( builder ) {
			Object.assign( omnibarNode, built );
		}

		if ( ! node.parent && omnibarNode !== omnibarNodes.home && omnibarNode !== omnibarNodes.site ) {
			siteNodes.push( omnibarNode );
		} else if ( node.parent === 'top-secondary' && omnibarNode !== omnibarNodes.user ) {
			userNodes.push( omnibarNode );
		}

		nodeMap.set( node.id, omnibarNode );
	}

	if ( siteNodes.length > 0 ) {
		omnibarNodes.siteNodes = siteNodes;
	}

	if ( userNodes.length > 0 ) {
		omnibarNodes.userNodes = userNodes;
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

export function parseAdminBarNodeTitle( node: AdminBarNode ) {
	const doc = new DOMParser().parseFromString( node.title || '', 'text/html' );
	return {
		text: doc.body.textContent?.trim() || undefined,
		tooltip: doc.querySelector( '[title]' )?.getAttribute( 'title' )?.trim() || undefined,
	};
}
