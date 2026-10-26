import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import useGraphicHover from './use-graphic-hover';
import type { SVGProps } from 'react';
import './portfolio-sites.scss';

type Tone = 'blue' | 'green' | 'pink' | 'yellow' | 'purple' | 'celadon' | 'red' | 'orange';

function MiniSite( {
	layout,
	tone,
	...props
}: { layout: number; tone: Tone } & SVGProps< SVGSVGElement > ) {
	return (
		<svg
			className="agency-mini-site"
			data-tone={ tone }
			viewBox="0 0 160 90"
			aria-hidden="true"
			focusable="false"
			{ ...props }
		>
			<rect className="agency-mini-site__page" width="160" height="90" rx="6" />
			{ layout !== 3 && (
				<>
					<circle className="agency-mini-site__tone" cx="12" cy="10" r="3.5" />
					<path
						className="agency-mini-site__muted"
						d="M112 9h10v2.5h-10Zm16 0h10v2.5h-10Zm16 0h6v2.5h-6Z"
					/>
				</>
			) }
			{ layout === 0 && (
				<>
					<rect className="agency-mini-site__tone" y="20" width="160" height="52" />
					<path className="agency-mini-site__paper" d="M16 33h72v6H16Zm0 10h52v6H16Z" />
					<rect className="agency-mini-site__paper" x="16" y="56" width="26" height="8" rx="4" />
				</>
			) }
			{ layout === 1 && (
				<>
					<path className="agency-mini-site__ink" d="M14 30h58v6H14Zm0 10h44v6H14Z" />
					<path className="agency-mini-site__muted" d="M14 53h54v2.5H14Zm0 6h46v2.5H14Z" />
					<rect className="agency-mini-site__tone" x="14" y="68" width="24" height="8" rx="4" />
					<rect className="agency-mini-site__soft" x="88" y="22" width="58" height="56" rx="3" />
					<path className="agency-mini-site__tone" d="m88 70 16-20 12 13 8-8 22 21v1H88Z" />
					<circle className="agency-mini-site__tone" cx="132" cy="36" r="5" />
				</>
			) }
			{ layout === 2 && (
				<>
					<path className="agency-mini-site__ink" d="M52 24h56v5H52Z" />
					{ [ 14, 62, 110 ].map( ( x ) => (
						<g key={ x }>
							<rect
								className="agency-mini-site__soft"
								x={ x }
								y="36"
								width="36"
								height="32"
								rx="2"
							/>
							<circle className="agency-mini-site__tone" cx={ x + 18 } cy="52" r="8" />
							<path className="agency-mini-site__muted" d={ `M${ x } 73h22v2.5H${ x }Z` } />
						</g>
					) ) }
				</>
			) }
			{ layout === 3 && (
				<>
					<path className="agency-mini-site__ink" d="M44 12h72v5H44Z" />
					<rect className="agency-mini-site__tone" x="14" y="26" width="132" height="34" rx="2" />
					<path
						className="agency-mini-site__muted"
						d="M14 66h132v2.5H14Zm0 6h118v2.5H14Zm0 6h90v2.5H14Z"
					/>
				</>
			) }
			{ layout === 4 &&
				[ 10, 58, 106 ].flatMap( ( x, column ) =>
					[ 22, 56 ].map( ( y, row ) => (
						<rect
							key={ `${ x }-${ y }` }
							className={
								( column + row ) % 2 ? 'agency-mini-site__soft' : 'agency-mini-site__tone'
							}
							x={ x }
							y={ y }
							width="44"
							height="30"
							rx="2"
						/>
					) )
				) }
		</svg>
	);
}

function getSites() {
	const otherHost = __( 'Other host' );
	return [
		{
			name: 'Juniper Studio',
			url: 'juniper.example',
			host: 'WordPress.com',
			layout: 0,
			tone: 'blue',
		},
		{ name: 'Fern & Co', url: 'fern.example', host: 'Pressable', layout: 1, tone: 'green' },
		{ name: 'Paper Plane', url: 'paperplane.example', host: otherHost, layout: 2, tone: 'pink' },
		{
			name: 'Harbor Coffee',
			url: 'harbor.example',
			host: 'WordPress.com',
			layout: 3,
			tone: 'orange',
		},
		{ name: 'Northwind', url: 'northwind.example', host: 'Pressable', layout: 4, tone: 'purple' },
		{
			name: 'Little Fox Books',
			url: 'littlefox.example',
			host: otherHost,
			layout: 1,
			tone: 'celadon',
		},
		{ name: 'Maple Dental', url: 'maple.example', host: 'WordPress.com', layout: 0, tone: 'red' },
		{
			name: 'Atlas Run Club',
			url: 'atlasrun.example',
			host: 'Pressable',
			layout: 2,
			tone: 'yellow',
		},
		{ name: 'Brightside', url: 'brightside.example', host: otherHost, layout: 3, tone: 'blue' },
	] satisfies { name: string; url: string; host: string; layout: number; tone: Tone }[];
}

const BROWSE_SPEED = 30;

export default function PortfolioSitesList() {
	const sites = getSites();
	const trackRef = useRef< HTMLDivElement >( null );
	const motion = useRef( { offset: 0, speed: 0, last: 0, frame: 0 } );
	const hovered = useGraphicHover( trackRef );
	useEffect( () => {
		const track = trackRef.current;
		const state = motion.current;
		if ( ! track ) {
			return;
		}
		const target = hovered ? BROWSE_SPEED : 0;
		// Ease the scroll speed so the list glides in and out of motion.
		const tick = ( time: number ) => {
			const elapsed = state.last ? Math.min( 0.05, ( time - state.last ) / 1000 ) : 0;
			state.last = time;
			state.speed += ( target - state.speed ) * Math.min( 1, elapsed * 2.5 );
			state.offset = ( state.offset + state.speed * elapsed ) % ( track.scrollHeight / 2 );
			track.style.transform = `translateY( ${ -state.offset }px )`;
			if ( ! target && state.speed < 0.5 ) {
				state.speed = 0;
				state.last = 0;
				return;
			}
			state.frame = requestAnimationFrame( tick );
		};
		state.last = 0;
		state.frame = requestAnimationFrame( tick );
		return () => cancelAnimationFrame( state.frame );
	}, [ hovered ] );
	return (
		<div className="agency-portfolio-sites">
			<div className="agency-portfolio-sites__viewport">
				<div className="agency-portfolio-sites__track" ref={ trackRef }>
					{ [ ...sites, ...sites ].map( ( site, index ) => (
						<div className="agency-portfolio-sites__row" key={ index }>
							<MiniSite layout={ site.layout } tone={ site.tone } />
							<span className="agency-portfolio-sites__identity">
								<strong>{ site.name }</strong>
								<bdi>{ site.url }</bdi>
							</span>
							<span className="agency-portfolio-sites__host">{ site.host }</span>
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
}
