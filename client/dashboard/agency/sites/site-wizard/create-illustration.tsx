import { useId, useRef } from 'react';
import useCreateIllustrationMotion from './use-create-illustration-motion';
import './create-illustration.scss';

const PENCIL = 'M-2-5v-17a2 2 0 0 1 4 0v17L0 0Z';

function Blueprint( { maskId }: { maskId: string } ) {
	return (
		<>
			<defs>
				<mask id={ maskId } maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="64">
					<rect width="80" height="64" fill="white" stroke="none" />
					<g data-pencil transform="translate(60 50) rotate(27)">
						<path d={ PENCIL } fill="black" stroke="black" strokeWidth="2.4" />
					</g>
				</mask>
			</defs>
			<g mask={ `url(#${ maskId })` }>
				<path d="M17 12h39v40H13.5" />
				<path d="M17 12a3.5 3.5 0 0 0-7 0v36.5a3.5 3.5 0 0 0 7 0Z" />
				<path d="M10 48.5a3.5 3.5 0 0 1 7 0" strokeWidth="0.8" />
				<g strokeWidth="0.45" opacity="0.16">
					{ [ 24, 30, 36, 42, 48 ].map( ( x ) => (
						<path key={ x } d={ `M${ x } 13v38` } />
					) ) }
					{ [ 18, 24, 30, 36, 42, 48 ].map( ( y ) => (
						<path key={ y } d={ `M18 ${ y }h37` } />
					) ) }
				</g>
				<g strokeWidth="0.8">
					<rect x="23" y="20" width="27" height="25" rx="1.5" />
					<path d="M23 26h27M27 23h0.3m3 0h0.3M40 30h6M40 34h5M28 41h17" />
					<path d="M28 30h7v7h-7Z" strokeDasharray="1.4 1.7" opacity="0.32" />
					<path className="agency-create__ink" d="M28 30h7v7h-7Z" pathLength="1" />
				</g>
			</g>
			<g data-pencil transform="translate(60 50) rotate(27)">
				<path d={ PENCIL } />
				<path d="M-2-19h4M-2-5h4M0-16v8" strokeWidth="0.65" />
				<path d="m-0.7-1.7 .7 1.7 .7-1.7" fill="currentColor" stroke="none" />
			</g>
		</>
	);
}

function Production( { clipId }: { clipId: string } ) {
	return (
		<>
			<defs>
				<clipPath id={ clipId }>
					<path d="M17.6 21.6h44.8V40a2.4 2.4 0 0 1-2.4 2.4H20a2.4 2.4 0 0 1-2.4-2.4Z" />
				</clipPath>
			</defs>
			<path className="agency-create__supports" d="M25 43v3m30-3v3" strokeWidth="0.8" />
			<g className="agency-create__server">
				<rect x="14" y="46" width="52" height="8" rx="1.5" />
				<circle
					className="agency-create__status"
					cx="20"
					cy="50"
					r="0.8"
					fill="currentColor"
					stroke="none"
				/>
				<circle
					className="agency-create__status"
					cx="24"
					cy="50"
					r="0.65"
					fill="currentColor"
					stroke="none"
				/>
				<path d="M55 49v2m3-2v2m3-2v2" strokeWidth="0.5" />
			</g>
			<g className="agency-create__site">
				<rect x="17" y="14" width="46" height="29" rx="3" />
				<path d="M17 21h46M22 17.5h0.4m3.5 0h0.4" strokeWidth="0.8" />
				<circle
					className="agency-create__online"
					cx="58"
					cy="17.5"
					r="0.8"
					fill="currentColor"
					stroke="none"
				/>
				<g clipPath={ `url(#${ clipId })` } strokeWidth="0.8">
					<g className="agency-create__site-image">
						<rect x="23" y="26" width="12" height="12" rx="1" />
						<path d="m25 35 3-4 2 3 1-1 2 2" strokeWidth="0.65" />
					</g>
					<g className="agency-create__site-copy">
						<path d="M41 27h15M41 31h12" />
						<rect x="41" y="35" width="9" height="3" rx="1.5" />
					</g>
				</g>
			</g>
		</>
	);
}

export default function CreateIllustration( { kind }: { kind: 'development' | 'production' } ) {
	const id = useId();
	const svg = useRef< SVGSVGElement >( null );
	useCreateIllustrationMotion( svg, kind );
	return (
		<svg
			ref={ svg }
			className="agency-site-wizard__illustration agency-create"
			viewBox="0 0 80 64"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{ kind === 'development' ? <Blueprint maskId={ id } /> : <Production clipId={ id } /> }
		</svg>
	);
}
