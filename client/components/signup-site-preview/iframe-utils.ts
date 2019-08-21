// This module is for dealing with DOM elements from inside the the site preview
// iframe. This means that not every modern JS feature will be available to use
// because they won't have been polyfilled e.g. a NodeList from the iframe isn't
// iterable using a for-of loop.
/* eslint no-for-of-loops/no-for-of-loops: 2 */

/**
 * External dependencies
 */
import { forEach } from 'lodash';
import { RefObject } from 'react';

/**
 * Internal dependencies
 */
import { isIE, getIframeSource, revokeObjectURL } from './utils';

type IFrameRef = RefObject< HTMLIFrameElement >;

/**
 * @param iframe frame in which to set the content
 * @param html html content to set in iframe
 * @returns true if innerHTML was set successfully
 */
export function setEntryContentInnerHTML( iframe: IFrameRef, html: string ): boolean {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return false;
	}
	const element = iframe.current.contentWindow.document.querySelector( '.entry-content' );
	if ( ! element ) {
		return false;
	}

	element.innerHTML = html;
	return true;
}

export function setIframeElementContent(
	iframe: IFrameRef,
	selector: string,
	textContent: string
) {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return;
	}
	const elements = iframe.current.contentWindow.document.querySelectorAll( selector );

	forEach( elements, element => {
		element.textContent = textContent;
	} );
}

export function setBodyOnClick( iframe: IFrameRef, onClick: GlobalEventHandlers['onclick'] ) {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return;
	}
	const element = iframe.current.contentWindow.document.body;

	if ( element ) {
		element.onclick = onClick;
	}
}

export function setIframeIsLoading( iframe: IFrameRef ) {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return;
	}
	const element = iframe.current.contentWindow.document.querySelector( '.home' );

	if ( element ) {
		element.classList.remove( 'is-loading' );
	}
}

export function getPageScrollHeight( iframe: IFrameRef ): number | null {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return null;
	}

	const element = iframe.current.contentWindow.document.querySelector( '#page' );
	if ( ! element ) {
		return null;
	}

	return element.scrollHeight;
}

interface PreviewContent {
	body: string;
	params: Record< string, string >;
	title: string;
	tagline: string;
}

export function setIframeSource(
	iframe: IFrameRef,
	content: PreviewContent,
	cssUrl: string,
	fontUrl: string,
	gutenbergStylesUrl: string,
	isRtl: boolean,
	langSlug: string,
	scrolling: boolean
) {
	if ( ! iframe.current || ! iframe.current.contentWindow ) {
		return;
	}

	const iframeSrc = getIframeSource(
		content,
		cssUrl,
		fontUrl,
		gutenbergStylesUrl,
		isRtl,
		langSlug,
		scrolling
	);

	if ( isIE() ) {
		iframe.current.contentWindow.document.open();
		iframe.current.contentWindow.document.write( iframeSrc );
		iframe.current.contentWindow.document.close();
	} else {
		revokeObjectURL( iframe.current.src );
		iframe.current.contentWindow.location.replace( iframeSrc );
	}
}
