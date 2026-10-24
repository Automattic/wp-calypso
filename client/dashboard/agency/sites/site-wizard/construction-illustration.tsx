import { useRef } from 'react';
import {
	contentTransform,
	restBounds,
	restPose,
	transform,
	useTileMotion,
} from './tile-illustration-motion';
import type { CSSProperties } from 'react';
import './construction-illustration.scss';

export type Tile = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	kind: 'chrome' | 'image' | 'text' | 'button';
	radius?: number;
};

const TILES: Tile[] = [
	{ id: 'a', x: 19, y: 26, w: 20, h: 12, kind: 'image' },
	{ id: 'b', x: 41, y: 26, w: 20, h: 12, kind: 'text' },
	{ id: 'c', x: 19, y: 40, w: 20, h: 12, kind: 'button' },
	{ id: 'header', x: 19, y: 16, w: 42, h: 8, kind: 'chrome', radius: 2 },
];

function TileContent( { tile }: { tile: Tile } ) {
	const { x, y, w, h, kind } = tile;
	const cy = y + h / 2;
	if ( kind === 'chrome' ) {
		return <path d={ `M${ x + 5 } ${ cy }h0.5m3.5 0h0.5` } />;
	}
	if ( kind === 'image' ) {
		return (
			<path
				d={ `M${ x + w * 0.17 } ${ y + h * 0.71 }l${ w * 0.17 } ${ -h * 0.35 } ${ w * 0.14 } ${ h * 0.28 } ${ w * 0.1 } ${ -h * 0.14 } ${ w * 0.21 } ${ h * 0.21 }` }
			/>
		);
	}
	if ( kind === 'button' ) {
		return <rect x={ x + w * 0.25 } y={ cy - 1.5 } width={ w * 0.5 } height="3" rx="1.5" />;
	}
	return <path d={ `M${ x + 5 } ${ cy }h${ w - 10 }` } />;
}

export default function ConstructionIllustration() {
	const svgRef = useRef< SVGSVGElement >( null );
	useTileMotion( svgRef, TILES );
	return (
		<svg
			ref={ svgRef }
			className="agency-site-wizard__illustration agency-construction"
			viewBox="0 0 80 64"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{ TILES.map( ( tile ) => (
				<g
					key={ tile.id }
					className="agency-construction__tile"
					style={
						{
							'--tile-from': transform( restPose( tile ) ),
							'--tile-origin': `${ tile.x + tile.w / 2 }px ${ tile.y + tile.h / 2 }px`,
							'--tile-content-from': contentTransform( tile, restBounds( tile ) ),
						} as CSSProperties
					}
				>
					<g className="agency-construction__tile-play">
						<rect
							className="agency-construction__tile-outline"
							x={ tile.x }
							y={ tile.y }
							width={ restBounds( tile ).w }
							height={ tile.h }
							rx={ tile.radius ?? 1.5 }
						/>
						<g className="agency-construction__tile-content" strokeWidth="0.8">
							<TileContent tile={ tile } />
						</g>
					</g>
				</g>
			) ) }
		</svg>
	);
}
