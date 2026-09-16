/**
 * Builds a `<p>` wrapping a link to an external URL.
 *
 * Uses DOM APIs rather than an `innerHTML` string so that neither the URL nor the label can
 * break out of its attribute or text position and introduce markup of its own.
 * @param {string} href URL to link to
 * @param {string} text Link label
 * @returns {Element} A paragraph element containing the link
 */
export function externalLinkParagraph( href, text ) {
	const link = document.createElement( 'a' );
	link.setAttribute( 'target', '_blank' );
	link.setAttribute( 'rel', 'external noopener noreferrer' );
	link.setAttribute( 'href', href );
	link.textContent = text;

	const paragraph = document.createElement( 'p' );
	paragraph.appendChild( link );

	return paragraph;
}
