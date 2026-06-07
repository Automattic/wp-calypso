import React from 'react';

function getSafeHref( href: string ): string | undefined {
	const trimmed = href.trim();
	if ( /^(https?:|mailto:)/i.test( trimmed ) ) {
		return trimmed;
	}
	return undefined;
}

function renderInlineMarkdown( text: string ): React.ReactNode[] {
	const nodes: React.ReactNode[] = [];
	const pattern =
		/(\[[^\]]+\]\([^\)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ( ( match = pattern.exec( text ) ) ) {
		if ( match.index > lastIndex ) {
			nodes.push( text.slice( lastIndex, match.index ) );
		}

		const token = match[ 0 ];
		const key = `${ match.index }-${ token }`;
		const link = token.match( /^\[([^\]]+)\]\(([^\)]+)\)$/ );
		if ( link ) {
			const href = getSafeHref( link[ 2 ] );
			nodes.push(
				href ? (
					<a
						key={ key }
						href={ href }
						rel="noreferrer"
						target="_blank"
					>
						{ link[ 1 ] }
					</a>
				) : (
					token
				)
			);
		} else if ( token.startsWith( '`' ) ) {
			nodes.push( <code key={ key }>{ token.slice( 1, -1 ) }</code> );
		} else if ( token.startsWith( '**' ) || token.startsWith( '__' ) ) {
			nodes.push( <strong key={ key }>{ token.slice( 2, -2 ) }</strong> );
		} else {
			nodes.push( <em key={ key }>{ token.slice( 1, -1 ) }</em> );
		}

		lastIndex = pattern.lastIndex;
	}

	if ( lastIndex < text.length ) {
		nodes.push( text.slice( lastIndex ) );
	}

	return nodes;
}

function flushList(
	blocks: React.ReactNode[],
	listItems: string[],
	ordered: boolean,
	key: string
): void {
	if ( listItems.length === 0 ) {
		return;
	}
	const children = listItems.map( ( item, index ) => (
		<li key={ index }>{ renderInlineMarkdown( item ) }</li>
	) );
	blocks.push(
		ordered ? (
			<ol key={ key }>{ children }</ol>
		) : (
			<ul key={ key }>{ children }</ul>
		)
	);
	listItems.length = 0;
}

export function LightweightMarkdownRenderer( {
	children,
}: {
	children: string;
} ) {
	const blocks: React.ReactNode[] = [];
	const listItems: string[] = [];
	let listOrdered = false;
	let inFence = false;
	let fenceLines: string[] = [];

	children.split( /\r?\n/ ).forEach( ( line, index ) => {
		if ( line.startsWith( '```' ) ) {
			if ( inFence ) {
				blocks.push(
					<pre key={ `code-${ index }` }>
						<code>{ fenceLines.join( '\n' ) }</code>
					</pre>
				);
				fenceLines = [];
				inFence = false;
			} else {
				flushList( blocks, listItems, listOrdered, `list-${ index }` );
				inFence = true;
			}
			return;
		}

		if ( inFence ) {
			fenceLines.push( line );
			return;
		}

		const unordered = line.match( /^\s*[-*]\s+(.+)$/ );
		const ordered = line.match( /^\s*\d+\.\s+(.+)$/ );
		if ( unordered || ordered ) {
			const nextOrdered = !! ordered;
			if ( listItems.length && listOrdered !== nextOrdered ) {
				flushList( blocks, listItems, listOrdered, `list-${ index }` );
			}
			listOrdered = nextOrdered;
			listItems.push(
				( ordered?.[ 1 ] ?? unordered?.[ 1 ] ?? '' ).trim()
			);
			return;
		}

		flushList( blocks, listItems, listOrdered, `list-${ index }` );

		if ( ! line.trim() ) {
			return;
		}

		const heading = line.match( /^(#{1,3})\s+(.+)$/ );
		if ( heading ) {
			const level = heading[ 1 ].length;
			const Tag = `h${ level }` as 'h1' | 'h2' | 'h3';
			blocks.push(
				<Tag key={ `heading-${ index }` }>
					{ renderInlineMarkdown( heading[ 2 ] ) }
				</Tag>
			);
			return;
		}

		blocks.push(
			<p key={ `paragraph-${ index }` }>
				{ renderInlineMarkdown( line ) }
			</p>
		);
	} );

	flushList( blocks, listItems, listOrdered, 'list-final' );

	if ( inFence && fenceLines.length ) {
		blocks.push(
			<pre key="code-final">
				<code>{ fenceLines.join( '\n' ) }</code>
			</pre>
		);
	}

	return <>{ blocks }</>;
}
