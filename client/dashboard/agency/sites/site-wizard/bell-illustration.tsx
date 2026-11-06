import './bell-illustration.scss';

/** A service bell: someone else handles it. Rings when its card is hovered. */
export default function BellIllustration() {
	return (
		<svg
			className="agency-site-wizard__illustration agency-bell"
			viewBox="0 0 80 64"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<g className="agency-bell__ring" strokeWidth="1">
				<path d="M22 22l3 3" />
				<path d="M18 31h4" />
				<path d="M58 22l-3 3" />
				<path d="M62 31h-4" />
			</g>
			<g className="agency-bell__body">
				<path d="M36 22h8" strokeWidth="1.6" />
				<path d="M40 22v8" />
				<path d="M24 46a16 16 0 0 1 32 0" />
				<path d="M30 40a10 10 0 0 1 4.5-6" strokeWidth="0.8" />
			</g>
			<path d="M20 46h40" />
			<rect x="22" y="46" width="36" height="5" rx="1" />
		</svg>
	);
}
