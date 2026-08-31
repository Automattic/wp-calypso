import { Path, SVG } from '@wordpress/primitives';
import type { SVGAttributes } from 'react';

type SvgRule = SVGAttributes< SVGPathElement >[ 'fillRule' ];

const attribute = ( element: Element, name: string ) => element.getAttribute( name ) ?? undefined;

// Site-generated markup is rebuilt, never injected: only the `<svg>` and its `<path>` children survive.
export function adminBarIcon( className: string, markup: string | undefined ) {
	const svg = markup
		? new DOMParser().parseFromString( markup, 'text/html' ).querySelector( 'svg' )
		: null;
	const paths = svg ? Array.from( svg.querySelectorAll( 'path' ) ) : [];

	if ( ! svg || ! paths.length ) {
		return undefined;
	}

	return (
		<span className={ className }>
			<SVG viewBox={ attribute( svg, 'viewBox' ) } xmlns="http://www.w3.org/2000/svg">
				{ paths.map( ( path, index ) => (
					<Path
						key={ index }
						d={ attribute( path, 'd' ) }
						fill={ attribute( path, 'fill' ) }
						fillRule={ attribute( path, 'fill-rule' ) as SvgRule }
						clipRule={ attribute( path, 'clip-rule' ) as SvgRule }
					/>
				) ) }
			</SVG>
		</span>
	);
}
