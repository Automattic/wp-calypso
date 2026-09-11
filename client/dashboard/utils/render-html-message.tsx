import { Fragment } from 'react';
import { isWebUrl } from './is-web-url';
import type { ReactNode } from 'react';

const EMPHASIS_TAGS = new Set( [ 'strong', 'em', 'b', 'i' ] );

function renderChildren( parent: ParentNode ): ReactNode[] {
	return Array.from( parent.childNodes ).map( renderNode );
}

function renderNode( node: ChildNode, key: number ): ReactNode {
	if ( node.nodeType === Node.TEXT_NODE ) {
		return node.textContent;
	}

	if ( node.nodeType !== Node.ELEMENT_NODE ) {
		return null;
	}

	const element = node as Element;
	const tag = element.tagName.toLowerCase();
	const children = renderChildren( element );

	if ( tag === 'a' ) {
		const href = element.getAttribute( 'href' );
		if ( href && isWebUrl( href ) ) {
			return (
				<a key={ key } href={ href } target="_blank" rel="noopener noreferrer">
					{ children }
				</a>
			);
		}
	}

	if ( tag === 'br' ) {
		return <br key={ key } />;
	}

	if ( EMPHASIS_TAGS.has( tag ) ) {
		const Tag = tag as 'strong' | 'em' | 'b' | 'i';
		return <Tag key={ key }>{ children }</Tag>;
	}

	return <Fragment key={ key }>{ children }</Fragment>;
}

/**
 * Renders an HTML message from the server as React nodes. Only links to web
 * URLs, line breaks and basic emphasis are kept; everything else is flattened
 * to its text. The result is a single element so it lays out as one unit
 * inside flex containers such as the snackbar.
 */
export function renderHtmlMessage( html: string ): ReactNode {
	const { body } = new DOMParser().parseFromString( html, 'text/html' );
	return <span>{ renderChildren( body ) }</span>;
}
