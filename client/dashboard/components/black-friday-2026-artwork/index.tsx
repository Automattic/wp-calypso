import { useId } from 'react';
import adBg from './ad-bg.png';
import adStipple from './ad-stipple.png';
import tileGreen from './tile-green.png';
import tileLilac from './tile-lilac.png';

import './style.scss';

// Design space of the artwork; the SVG scales it to whatever width it gets.
const WIDTH = 896;
const HEIGHT = 312;
const RIBBON_LENGTH = 2419;
const RIBBON_HEIGHT = 269;
// One repeat of each ribbon's lettering, and where the first repeat sits.
const GREEN_PERIOD = 484;
const GREEN_OFFSET = 438;
const LILAC_PERIOD = 754;
const LILAC_OFFSET = 124;

/**
 * The Black Friday 2026 "25% OFF / SALE" ribbons artwork used by the in-product
 * promo cards. Decorative only. The lettering drifts along each ribbon unless
 * the viewer prefers reduced motion.
 */
export default function BlackFriday2026Artwork( { className }: { className?: string } ) {
	const id = useId();
	const greenPattern = `${ id }-green`;
	const lilacPattern = `${ id }-lilac`;
	const frameClip = `${ id }-frame`;
	const ribbonClip = `${ id }-ribbon`;

	return (
		<svg
			className={ className ? `bf2026-artwork ${ className }` : 'bf2026-artwork' }
			viewBox={ `0 0 ${ WIDTH } ${ HEIGHT }` }
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<pattern
					id={ greenPattern }
					patternUnits="userSpaceOnUse"
					x={ GREEN_OFFSET }
					width={ GREEN_PERIOD }
					height={ RIBBON_HEIGHT }
				>
					<image href={ tileGreen } width={ GREEN_PERIOD } height={ RIBBON_HEIGHT } />
				</pattern>
				<pattern
					id={ lilacPattern }
					patternUnits="userSpaceOnUse"
					x={ LILAC_OFFSET }
					width={ LILAC_PERIOD }
					height={ RIBBON_HEIGHT }
				>
					<image href={ tileLilac } width={ LILAC_PERIOD } height={ RIBBON_HEIGHT } />
				</pattern>
				<clipPath id={ frameClip }>
					<rect width={ WIDTH } height={ HEIGHT } rx="12" />
				</clipPath>
				<clipPath id={ ribbonClip }>
					<rect width={ RIBBON_LENGTH } height={ RIBBON_HEIGHT } />
				</clipPath>
			</defs>
			<g clipPath={ `url(#${ frameClip })` }>
				<image href={ adBg } width={ WIDTH } height={ HEIGHT } />
				<g transform="matrix(0.9659 0.2588 -0.2588 0.9659 -391.82 -302.43)">
					<g clipPath={ `url(#${ ribbonClip })` }>
						<rect width={ RIBBON_LENGTH } height={ RIBBON_HEIGHT } fill="#48ff50" />
						<rect
							className="bf2026-artwork__lettering is-green"
							x={ -GREEN_PERIOD }
							width={ RIBBON_LENGTH + 2 * GREEN_PERIOD }
							height={ RIBBON_HEIGHT }
							fill={ `url(#${ greenPattern })` }
						/>
					</g>
				</g>
				<g transform="matrix(0.9025 -0.4306 0.4306 0.9025 -819.98 539.86)">
					<g clipPath={ `url(#${ ribbonClip })` }>
						<rect width={ RIBBON_LENGTH } height={ RIBBON_HEIGHT } fill="#ae94fb" />
						<rect
							className="bf2026-artwork__lettering is-lilac"
							x={ -LILAC_PERIOD }
							width={ RIBBON_LENGTH + 2 * LILAC_PERIOD }
							height={ RIBBON_HEIGHT }
							fill={ `url(#${ lilacPattern })` }
						/>
					</g>
				</g>
				<image href={ adStipple } width={ WIDTH } height={ HEIGHT } />
			</g>
		</svg>
	);
}
