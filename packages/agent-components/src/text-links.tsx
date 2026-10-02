import type { ReactNode } from 'react';

export function linkifyText( text: string ): ReactNode[] {
	const parts: ReactNode[] = [];
	let offset = 0;
	for ( const match of text.matchAll( /https?:\/\/[^\s<>"']+/gi ) ) {
		const start = match.index;
		const label = match[ 0 ].replace( /[),.;!?\]}]+$/, '' );
		if ( start > 0 && /[\w:]/.test( text[ start - 1 ] ) ) {
			continue;
		}
		try {
			const url = new URL( label );
			if (
				! [ 'http:', 'https:' ].includes( url.protocol ) ||
				! url.hostname ||
				url.username ||
				url.password ||
				label.includes( '\\' )
			) {
				continue;
			}
		} catch {
			continue;
		}
		parts.push(
			text.slice( offset, start ),
			<a key={ start } href={ label } target="_blank" rel="noopener noreferrer">
				{ label }
			</a>
		);
		offset = start + label.length;
	}
	parts.push( text.slice( offset ) );
	return parts;
}
