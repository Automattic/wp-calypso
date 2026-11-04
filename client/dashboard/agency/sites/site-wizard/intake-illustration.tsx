import { useId } from 'react';
import './intake-illustration.scss';

export default function IntakeIllustration( { kind }: { kind: 'spreadsheet' | 'account' } ) {
	const windowMask = useId();
	return (
		<svg
			className="agency-site-wizard__intake-illustration"
			viewBox="0 0 64 56"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.4"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{ kind === 'spreadsheet' ? (
				<g className="agency-site-wizard__sheet-page">
					<path d="M18 7h22l9 9v30a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z" />
					<path d="M40 7v7a2 2 0 0 0 2 2h7" />
					<path d="M21 14h10M21 18h6" strokeWidth="1" />
					<path d="M20 24h24v6H20Z" fill="currentColor" fillOpacity="0.08" stroke="none" />
					<rect x="20" y="24" width="24" height="18" rx="1" strokeWidth="1" />
					<path d="M27 24v18m9-18v18M20 30h24M20 36h24" strokeWidth="1" />
					<g className="agency-site-wizard__sheet-entries" strokeWidth="1">
						{ [ 27, 33, 39 ].map( ( y ) => (
							<path key={ y } d={ `M22 ${ y }h3m4 0h5m4 0h4` } pathLength="1" />
						) ) }
					</g>
				</g>
			) : (
				<>
					<defs>
						<mask id={ windowMask } maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="56">
							<rect width="64" height="56" fill="white" stroke="none" />
							<rect
								className="agency-site-wizard__account-front"
								x="16.3"
								y="17.3"
								width="39.4"
								height="29.4"
								rx="3.7"
								fill="black"
								stroke="none"
							/>
						</mask>
					</defs>
					<g mask={ `url(#${ windowMask })` }>
						<g className="agency-site-wizard__account-back">
							<rect x="10" y="8" width="37" height="28" rx="3" />
							<path d="M10 15h37" strokeWidth="1" />
						</g>
					</g>
					<g className="agency-site-wizard__account-front">
						<rect x="17" y="18" width="38" height="28" rx="3" />
						<path d="M17 25h38M22 21.5h1m3 0h1" strokeWidth="1" />
						<rect
							x="22"
							y="30"
							width="8"
							height="10"
							rx="1"
							fill="currentColor"
							fillOpacity="0.08"
							strokeWidth="1"
						/>
						<path d="M35 31h14M35 35h14M35 39h8" strokeWidth="1" />
					</g>
				</>
			) }
		</svg>
	);
}
