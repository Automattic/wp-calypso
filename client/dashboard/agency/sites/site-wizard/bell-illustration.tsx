import { useId } from 'react';
import './bell-illustration.scss';

/**
 * A service bell: someone else handles it. Hovering its card presses the
 * plunger into the dome, and the ding ripples out.
 */
export default function BellIllustration() {
	// The plunger's stem slides into the dome; clipping at the dome's top hides
	// the part that has gone inside, so it never pokes through.
	const clipId = useId();
	return (
		<svg
			className="agency-site-wizard__illustration agency-bell"
			// Cropped close so the bell fills its box like the other drawings do.
			viewBox="10 12 60 48"
			fill="none"
			stroke="currentColor"
			strokeWidth="0.9"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<clipPath id={ clipId } clipPathUnits="userSpaceOnUse">
					<rect x="0" y="0" width="80" height="30.4" />
				</clipPath>
			</defs>
			<g className="agency-bell__ring is-near">
				<path d="M20.5 28.5q-2.5 4 0 8" />
				<path d="M59.5 28.5q2.5 4 0 8" />
			</g>
			<g className="agency-bell__ring is-far">
				<path d="M16.5 26q-3.5 6.5 0 13" />
				<path d="M63.5 26q3.5 6.5 0 13" />
			</g>
			<g clipPath={ `url(#${ clipId })` }>
				<g className="agency-bell__plunger">
					<path d="M36 22h8" strokeWidth="1.2" />
					<path d="M40 22v9" />
				</g>
			</g>
			<g className="agency-bell__dome">
				<path d="M24 46a16 16 0 0 1 32 0" />
				<path d="M30 40a10 10 0 0 1 4.5-6" strokeWidth="0.6" />
			</g>
			<path d="M20 46h40" />
			<rect x="22" y="46" width="36" height="5" rx="1" />
		</svg>
	);
}
