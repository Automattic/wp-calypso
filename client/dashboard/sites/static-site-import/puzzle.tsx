import { useReducedMotion } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useMshotImage } from './use-mshot-image';
import type { CSSProperties } from 'react';

import './puzzle.scss';

const TILES_PER_SIDE = 5;
const HOME = Array.from( { length: TILES_PER_SIDE * TILES_PER_SIDE }, ( _, tile ) => tile );
const CENTER = ( TILES_PER_SIDE - 1 ) / 2;
const MAX_DISTANCE = Math.hypot( CENTER, CENTER );
const SHUFFLE_INTERVAL = 900;
const RIPPLE_DELAY = 55;
const ENTRANCE_DURATION = 850;
// Percent background positions run 0 to 100 across the tiles, edge tile to edge tile.
const BACKGROUND_STEP = 100 / ( TILES_PER_SIDE - 1 );

function shuffle( cells: number[] ) {
	const next = cells.slice();
	for ( let swap = 0; swap < Math.round( next.length / 3 ); swap++ ) {
		const a = Math.floor( Math.random() * next.length );
		const b = Math.floor( Math.random() * next.length );
		[ next[ a ], next[ b ] ] = [ next[ b ], next[ a ] ];
	}
	return next;
}

function Tiles( { imageUrl, running }: { imageUrl?: string; running: boolean } ) {
	const [ cellByTile, setCellByTile ] = useState( HOME );
	const [ moves, setMoves ] = useState( 0 );
	const [ isEntering, setIsEntering ] = useState( true );
	const [ canShuffle, setCanShuffle ] = useState( false );

	useEffect( () => {
		const frame = window.requestAnimationFrame( () => setIsEntering( false ) );
		const timeout = window.setTimeout( () => setCanShuffle( true ), ENTRANCE_DURATION );
		return () => {
			window.cancelAnimationFrame( frame );
			window.clearTimeout( timeout );
		};
	}, [] );

	useEffect( () => {
		if ( ! canShuffle || ! running ) {
			return;
		}
		const interval = window.setInterval( () => {
			setCellByTile( shuffle );
			setMoves( ( count ) => count + 1 );
		}, SHUFFLE_INTERVAL );
		return () => window.clearInterval( interval );
	}, [ canShuffle, running ] );

	const placement = running ? cellByTile : HOME;
	const isFromEdges = ! running || moves % 2 === 1;

	return (
		<div
			className={ clsx( 'static-site-import-puzzle__tiles', {
				'is-entering': isEntering,
				'is-waiting': ! imageUrl,
				'is-settled': ! running,
			} ) }
		>
			<div
				className="static-site-import-puzzle__grid"
				style={ { '--static-site-import-puzzle-tiles': TILES_PER_SIDE } as CSSProperties }
			>
				{ placement.map( ( cell, tile ) => {
					const column = tile % TILES_PER_SIDE;
					const row = Math.floor( tile / TILES_PER_SIDE );
					const distance = Math.hypot( column - CENTER, row - CENTER );
					const delay = ( isFromEdges ? MAX_DISTANCE - distance : distance ) * RIPPLE_DELAY;
					return (
						<div
							key={ tile }
							className="static-site-import-puzzle__tile"
							style={ {
								backgroundImage: imageUrl && `url("${ imageUrl }")`,
								backgroundPosition: `${ column * BACKGROUND_STEP }% ${ row * BACKGROUND_STEP }%`,
								transform: `translate(${ ( ( cell % TILES_PER_SIDE ) - column ) * 100 }%, ${
									( Math.floor( cell / TILES_PER_SIDE ) - row ) * 100
								}%) scale(var(--static-site-import-puzzle-scale))`,
								transitionDelay: `${ Math.round( delay ) }ms`,
							} }
						/>
					);
				} ) }
			</div>
		</div>
	);
}

/**
 * The site's screenshot cut into tiles that slide and swap while the move runs. When the preview
 * is ready they settle home and fade, revealing the still screenshot. Until the screenshot arrives
 * the tiles shuffle without it, and with reduced motion only the still shows.
 */
export function PuzzlePreview( { url, running }: { url: string; running: boolean } ) {
	const imageUrl = useMshotImage( url );
	const isReducedMotion = useReducedMotion();

	return (
		<div className="static-site-import-puzzle" aria-hidden="true">
			{ imageUrl && <img className="static-site-import-puzzle__image" src={ imageUrl } alt="" /> }
			{ /* A new set of tiles for the screenshot, so it grows in like the first set. */ }
			{ ! isReducedMotion && <Tiles key={ imageUrl } imageUrl={ imageUrl } running={ running } /> }
		</div>
	);
}
