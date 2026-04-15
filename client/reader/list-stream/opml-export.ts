import type { PublicListItem } from './use-public-list-query';

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
 * Generate an OPML XML string for a Reader list.
 */
export function generateListOpml( title: string, items: PublicListItem[] ): string {
	const outlines = items
		.filter( ( item ) => item.site_url )
		.map( ( item ) => {
			const text = escapeXml( item.site_name || item.site_url );
			const htmlUrl = escapeXml( item.site_url );
			const xmlUrl = escapeXml( item.site_url );
			return `      <outline text="${ text }" title="${ text }" type="rss" xmlUrl="${ xmlUrl }" htmlUrl="${ htmlUrl }" />`;
		} )
		.join( '\n' );

	const escapedTitle = escapeXml( title );

	return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${ escapedTitle }</title>
  </head>
  <body>
    <outline text="${ escapedTitle }" title="${ escapedTitle }">
${ outlines }
    </outline>
  </body>
</opml>`;
}

/**
 * Trigger a download of the OPML file.
 */
export function downloadListOpml( title: string, slug: string, items: PublicListItem[] ): void {
	const opml = generateListOpml( title, items );
	const blob = new Blob( [ opml ], { type: 'text/xml;charset=utf-8' } );
	const url = URL.createObjectURL( blob );
	const a = document.createElement( 'a' );
	a.href = url;
	a.download = `${ slug }.opml`;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	URL.revokeObjectURL( url );
}
