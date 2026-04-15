import { getAccountUrl } from '../data/packs';
import type { StarterPack } from '../data/packs';

/**
 * Escape a string for use in XML attribute values and text content.
 */
function escapeXml( str: string ): string {
	return str
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&apos;' );
}

/**
 * Generate an OPML XML string for a starter pack.
 */
export function generateOpml( pack: StarterPack ): string {
	const outlines = pack.accounts
		.filter( ( account ) => account.feedUrl )
		.map( ( account ) => {
			const title = escapeXml(
				`${ account.displayName } (@${ account.username }@${ account.instance })`
			);
			const htmlUrl = escapeXml( getAccountUrl( account ) );
			const xmlUrl = escapeXml( account.feedUrl! );
			return `      <outline text="${ title }" title="${ title }" type="rss" xmlUrl="${ xmlUrl }" htmlUrl="${ htmlUrl }" />`;
		} )
		.join( '\n' );

	const title = escapeXml( pack.title );

	return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${ title }</title>
  </head>
  <body>
    <outline text="${ title }" title="${ title }">
${ outlines }
    </outline>
  </body>
</opml>`;
}

/**
 * Trigger a download of the OPML file.
 */
export function downloadOpml( pack: StarterPack ): void {
	const opml = generateOpml( pack );
	const blob = new Blob( [ opml ], { type: 'text/xml;charset=utf-8' } );
	const url = URL.createObjectURL( blob );
	const a = document.createElement( 'a' );
	a.href = url;
	a.download = `${ pack.slug }.opml`;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	URL.revokeObjectURL( url );
}
