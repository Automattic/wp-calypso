import { useEffect } from 'react';
import type { RefObject } from 'react';

type Stop = [ number, number ];

function sample( time: number, stops: Stop[] ) {
	const next = stops.findIndex( ( [ at ] ) => at >= time );
	if ( next <= 0 ) {
		return stops[ next === 0 ? 0 : stops.length - 1 ][ 1 ];
	}
	const [ fromTime, from ] = stops[ next - 1 ];
	const [ toTime, to ] = stops[ next ];
	const progress = ( time - fromTime ) / ( toTime - fromTime );
	return from + ( to - from ) * progress * progress * ( 3 - 2 * progress );
}

function blueprintMotion( svg: SVGSVGElement ) {
	const pencils = svg.querySelectorAll< SVGGElement >( '[data-pencil]' );
	const ink = svg.querySelector< SVGPathElement >( '.agency-create__ink' );
	const length = ink?.getTotalLength?.() ?? 0;
	return ( time: number ) => {
		let x = sample( time, [
			[ 0, 60 ],
			[ 0.06, 61 ],
			[ 0.15, 48 ],
			[ 0.23, 28 ],
			[ 0.61, 28 ],
			[ 0.67, 31 ],
			[ 0.76, 55 ],
			[ 0.83, 61 ],
			[ 0.88, 59.6 ],
			[ 0.93, 60 ],
			[ 1, 60 ],
		] );
		let y = sample( time, [
			[ 0, 50 ],
			[ 0.06, 51 ],
			[ 0.15, 23 ],
			[ 0.23, 30 ],
			[ 0.61, 30 ],
			[ 0.67, 26 ],
			[ 0.76, 30 ],
			[ 0.83, 50.6 ],
			[ 0.88, 49.7 ],
			[ 0.93, 50 ],
			[ 1, 50 ],
		] );
		const angle = sample( time, [
			[ 0, 27 ],
			[ 0.06, 21 ],
			[ 0.15, 35 ],
			[ 0.23, 28 ],
			[ 0.34, 24 ],
			[ 0.45, 34 ],
			[ 0.56, 25 ],
			[ 0.61, 28 ],
			[ 0.69, 18 ],
			[ 0.8, 31 ],
			[ 0.87, 25 ],
			[ 0.93, 27 ],
			[ 1, 27 ],
		] );
		const progress = Math.min( 1, Math.max( 0, ( time - 0.23 ) / 0.38 ) );
		if ( ink && length && time >= 0.23 && time <= 0.61 ) {
			// Place the tip on the actual ink path, including each turn of the rectangle.
			const point = ink.getPointAtLength( length * progress );
			x = point.x;
			y = point.y;
		}
		pencils.forEach( ( pencil ) =>
			pencil.setAttribute( 'transform', `translate(${ x } ${ y }) rotate(${ angle })` )
		);
		if ( ink ) {
			ink.style.strokeDashoffset = String( 1 - progress );
			ink.style.opacity = String(
				sample( time, [
					[ 0, 0 ],
					[ 0.23, 0 ],
					[ 0.24, 1 ],
					[ 0.86, 1 ],
					[ 0.97, 0 ],
					[ 1, 0 ],
				] )
			);
		}
	};
}

function productionMotion( svg: SVGSVGElement ) {
	const site = svg.querySelector< SVGGElement >( '.agency-create__site' );
	const image = svg.querySelector< SVGGElement >( '.agency-create__site-image' );
	const copy = svg.querySelector< SVGGElement >( '.agency-create__site-copy' );
	const supports = svg.querySelector< SVGPathElement >( '.agency-create__supports' );
	const lights = svg.querySelectorAll< SVGCircleElement >( '.agency-create__status' );
	const online = svg.querySelector< SVGCircleElement >( '.agency-create__online' );
	return ( time: number ) => {
		const lift = sample( time, [
			[ 0, 0 ],
			[ 0.16, 0 ],
			[ 0.23, 0.7 ],
			[ 0.34, -4 ],
			[ 0.43, 0.5 ],
			[ 0.51, -0.8 ],
			[ 0.59, 0 ],
			[ 1, 0 ],
		] );
		const tilt = sample( time, [
			[ 0, 0 ],
			[ 0.16, 0 ],
			[ 0.23, -1.5 ],
			[ 0.34, 2 ],
			[ 0.43, -0.7 ],
			[ 0.52, 0.3 ],
			[ 0.6, 0 ],
			[ 1, 0 ],
		] );
		const squash = sample( time, [
			[ 0, 1 ],
			[ 0.16, 1 ],
			[ 0.23, 0.96 ],
			[ 0.32, 1.03 ],
			[ 0.43, 0.98 ],
			[ 0.52, 1.01 ],
			[ 0.6, 1 ],
			[ 1, 1 ],
		] );
		site?.setAttribute(
			'transform',
			`translate(40 ${ 43 + lift }) rotate(${ tilt }) scale(${ 2 - squash } ${ squash }) translate(-40 -43)`
		);
		const radians = ( tilt * Math.PI ) / 180;
		supports?.setAttribute(
			'd',
			[ -15, 15 ]
				.map( ( offset ) => {
					const x = 40 + offset * ( 2 - squash ) * Math.cos( radians );
					const y = 43 + lift + offset * ( 2 - squash ) * Math.sin( radians );
					return `M${ x } ${ y }L${ 40 + offset } 46`;
				} )
				.join( ' ' )
		);
		const imageLift = sample( time, [
			[ 0, 0 ],
			[ 0.27, 0 ],
			[ 0.36, 1.2 ],
			[ 0.46, -1.1 ],
			[ 0.55, 0.3 ],
			[ 0.64, 0 ],
			[ 1, 0 ],
		] );
		const copyLift = sample( time, [
			[ 0, 0 ],
			[ 0.3, 0 ],
			[ 0.4, 1 ],
			[ 0.5, -0.8 ],
			[ 0.59, 0.2 ],
			[ 0.67, 0 ],
			[ 1, 0 ],
		] );
		image?.setAttribute( 'transform', `translate(0 ${ imageLift })` );
		copy?.setAttribute( 'transform', `translate(0 ${ copyLift })` );
		lights.forEach( ( light, index ) => {
			const delay = index * 0.045;
			light.style.opacity = String(
				sample( time - delay, [
					[ 0, 0.45 ],
					[ 0.04, 1 ],
					[ 0.09, 0.25 ],
					[ 0.14, 1 ],
					[ 0.2, 0.45 ],
					[ 1, 0.45 ],
				] )
			);
		} );
		if ( online ) {
			online.style.opacity = String(
				sample( time, [
					[ 0, 0.45 ],
					[ 0.22, 0.45 ],
					[ 0.28, 1 ],
					[ 0.77, 1 ],
					[ 0.9, 0.45 ],
					[ 1, 0.45 ],
				] )
			);
		}
	};
}

export default function useCreateIllustrationMotion(
	ref: RefObject< SVGSVGElement | null >,
	kind: 'development' | 'production'
) {
	useEffect( () => {
		const svg = ref.current;
		if ( ! svg || typeof window.matchMedia !== 'function' ) {
			return;
		}
		const target = svg.closest( 'button' ) ?? svg;
		const reducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		const draw = kind === 'development' ? blueprintMotion( svg ) : productionMotion( svg );
		const duration = kind === 'development' ? 4800 : 3600;
		let hovered = target.matches( ':hover' );
		let focused = target === document.activeElement;
		let frame = 0;
		const reset = () => {
			cancelAnimationFrame( frame );
			frame = 0;
			draw( 0 );
		};
		const play = () => {
			if ( frame || reducedMotion.matches || document.hidden ) {
				return;
			}
			let start: number | undefined;
			const tick = ( now: number ) => {
				start ??= now;
				const elapsed = now - start;
				draw( Math.min( 1, elapsed / duration ) );
				if ( elapsed >= duration ) {
					if ( ! hovered && ! focused ) {
						reset();
						return;
					}
					start = now;
				}
				frame = requestAnimationFrame( tick );
			};
			frame = requestAnimationFrame( tick );
		};
		const enter = () => {
			hovered = true;
			play();
		};
		const leave = () => {
			hovered = false;
		};
		const focus = () => {
			focused = true;
			play();
		};
		const blur = () => {
			focused = false;
		};
		const restart = () => {
			reset();
			if ( hovered || focused ) {
				play();
			}
		};
		target.addEventListener( 'mouseenter', enter );
		target.addEventListener( 'mouseleave', leave );
		target.addEventListener( 'focus', focus );
		target.addEventListener( 'blur', blur );
		reducedMotion.addEventListener( 'change', restart );
		document.addEventListener( 'visibilitychange', restart );
		if ( hovered || focused ) {
			play();
		}
		return () => {
			reset();
			target.removeEventListener( 'mouseenter', enter );
			target.removeEventListener( 'mouseleave', leave );
			target.removeEventListener( 'focus', focus );
			target.removeEventListener( 'blur', blur );
			reducedMotion.removeEventListener( 'change', restart );
			document.removeEventListener( 'visibilitychange', restart );
		};
	}, [ ref, kind ] );
}
