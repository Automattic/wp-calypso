import { useId } from 'react';

/**
 * Heroicons v2 solid microphone (MIT) — filled geometry reads clearly at 18–20px;
 * thick stroked outlines were visually merging into one blob.
 * @see https://github.com/tailwindlabs/heroicons
 */
export function MicIcon( {
	size = 18,
	muted = false,
	animated = false,
}: {
	size?: number;
	muted?: boolean;
	animated?: boolean;
} ) {
	const shimmerId = `live-ai-assistant-mic-shimmer-${ useId().replace( /:/g, '' ) }`;

	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				{ ! muted && animated && (
					<linearGradient id={ shimmerId } x1="-120%" y1="120%" x2="-20%" y2="20%">
						<stop offset="0%" stopColor="currentColor" />
						<stop offset="10%" stopColor="currentColor" />
						<stop offset="50%" stopColor="#fff" />
						<stop offset="90%" stopColor="currentColor" />
						<stop offset="100%" stopColor="currentColor" />
						<animate
							attributeName="x1"
							values="-120%;120%;120%"
							keyTimes="0;0.18;1"
							dur="5s"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="x2"
							values="-20%;220%;220%"
							keyTimes="0;0.18;1"
							dur="5s"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="y1"
							values="120%;-120%;-120%"
							keyTimes="0;0.18;1"
							dur="5s"
							repeatCount="indefinite"
						/>
						<animate
							attributeName="y2"
							values="20%;-220%;-220%"
							keyTimes="0;0.18;1"
							dur="5s"
							repeatCount="indefinite"
						/>
					</linearGradient>
				) }
			</defs>
			<path
				fill={ ! muted && animated ? `url(#${ shimmerId })` : 'currentColor' }
				d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z"
			/>
			<path
				fill={ ! muted && animated ? `url(#${ shimmerId })` : 'currentColor' }
				d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z"
			/>
			{ muted && (
				<path
					d="M4 4l16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			) }
		</svg>
	);
}
