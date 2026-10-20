import { isWebUrl } from './is-web-url';

export interface HtmlMessage {
	text: string;
	link?: {
		label: string;
		url: string;
	};
}

/**
 * Turns an HTML message (as returned by some wpcom endpoints) into plain text,
 * with the first link lifted out so it can be rendered as a notice action.
 */
export function parseHtmlMessage( html: string ): HtmlMessage {
	const { body } = new DOMParser().parseFromString( html, 'text/html' );
	const text = ( body.textContent ?? '' ).replace( /\s+/g, ' ' ).trim();
	const anchor = body.querySelector( 'a[href]' );
	const label = anchor?.textContent?.replace( /\s+/g, ' ' ).trim();
	const url = anchor?.getAttribute( 'href' );

	if ( ! label || ! url || ! isWebUrl( url ) ) {
		return { text };
	}

	return { text, link: { label, url } };
}
