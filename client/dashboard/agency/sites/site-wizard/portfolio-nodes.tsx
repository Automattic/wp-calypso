import { AgencyHub, SiteNode } from './portfolio-art-primitives';
import type { CSSProperties } from 'react';

type Point = { x: number; y: number };
type Layout = { nodes: Point[]; paths: string[] };
type NodeVariant = 'connected' | 'branches' | 'clusters' | 'constellation';

function getLayout( variant: NodeVariant ): Layout {
	if ( variant === 'branches' ) {
		return {
			nodes: [ 44, 108, 372, 436 ].flatMap( ( x ) =>
				[ 62, 134, 206, 278 ].map( ( y ) => ( { x, y } ) )
			),
			paths: [
				'M152 62V278',
				'M328 62V278',
				'M152 170H240',
				'M328 170H240',
				...[ 62, 134, 206, 278 ].flatMap( ( y ) => [ `M44 ${ y }H152`, `M436 ${ y }H328` ] ),
			],
		};
	}
	if ( variant === 'clusters' ) {
		const centers = [
			{ x: 85, y: 78 },
			{ x: 395, y: 78 },
			{ x: 85, y: 262 },
			{ x: 395, y: 262 },
		];
		return {
			nodes: centers.flatMap( ( center ) =>
				[ -33, 33 ].flatMap( ( dx ) =>
					[ -26, 26 ].map( ( dy ) => ( { x: center.x + dx, y: center.y + dy } ) )
				)
			),
			paths: centers.flatMap( ( { x, y } ) => [
				`M${ x } ${ y }C${ x } 170 ${ x < 240 ? 170 : 310 } 170 240 170`,
				...[ -33, 33 ].flatMap( ( dx ) =>
					[ -26, 26 ].map( ( dy ) => `M${ x + dx } ${ y + dy }L${ x } ${ y }` )
				),
			] ),
		};
	}
	if ( variant === 'constellation' ) {
		const nodes = [
			[ 54, 52 ],
			[ 124, 35 ],
			[ 202, 47 ],
			[ 292, 35 ],
			[ 369, 48 ],
			[ 434, 85 ],
			[ 42, 130 ],
			[ 127, 110 ],
			[ 341, 112 ],
			[ 438, 165 ],
			[ 47, 209 ],
			[ 125, 214 ],
			[ 352, 219 ],
			[ 427, 248 ],
			[ 88, 288 ],
			[ 175, 294 ],
			[ 267, 292 ],
			[ 355, 294 ],
		].map( ( [ x, y ] ) => ( { x, y } ) );
		const links = [
			[ 0, 1 ],
			[ 1, 7 ],
			[ 2, 7 ],
			[ 6, 7 ],
			[ 3, 8 ],
			[ 4, 8 ],
			[ 5, 8 ],
			[ 10, 11 ],
			[ 14, 11 ],
			[ 15, 11 ],
			[ 9, 12 ],
			[ 13, 12 ],
			[ 16, 12 ],
			[ 17, 12 ],
		];
		return {
			nodes,
			paths: [
				...links.map(
					( [ from, to ] ) =>
						`M${ nodes[ from ].x } ${ nodes[ from ].y }L${ nodes[ to ].x } ${ nodes[ to ].y }`
				),
				...[ 7, 8, 11, 12 ].map( ( i ) => `M${ nodes[ i ].x } ${ nodes[ i ].y }L240 170` ),
			],
		};
	}
	const nodes = Array.from( { length: 12 }, ( _, index ) => {
		const angle = ( index * Math.PI ) / 6 - Math.PI / 2;
		return { x: 240 + 182 * Math.cos( angle ), y: 170 + 122 * Math.sin( angle ) };
	} );
	return { nodes, paths: nodes.map( ( { x, y } ) => `M${ x } ${ y }L240 170` ) };
}

export default function PortfolioNodes( { variant }: { variant: NodeVariant } ) {
	const { nodes, paths } = getLayout( variant );
	return (
		<svg
			className="agency-portfolio-art"
			viewBox="0 0 480 340"
			aria-hidden="true"
			focusable="false"
		>
			<g className="agency-portfolio-art__cords">
				{ paths.map( ( d ) => (
					<path key={ d } d={ d } />
				) ) }
			</g>
			<g className="agency-portfolio-art__node-signals">
				{ paths.map( ( d, i ) => (
					<path
						key={ d }
						d={ d }
						pathLength="100"
						style={ { '--arrival-delay': `${ ( i % 4 ) * 140 }ms` } as CSSProperties }
					/>
				) ) }
			</g>
			{ nodes.map( ( { x, y }, index ) => (
				<g key={ index } transform={ `translate(${ x } ${ y })` }>
					<SiteNode index={ index } />
				</g>
			) ) }
			<AgencyHub />
		</svg>
	);
}
