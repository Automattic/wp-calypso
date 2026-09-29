import { useId } from 'react';
import type { ResourceContentType } from './types';
import type { ReactNode } from 'react';

function VideoIllustration() {
	const id = useId();
	const clipId = `${ id }-frame`;
	const gradientId = `${ id }-light`;
	return (
		<>
			<defs>
				<linearGradient id={ gradientId } x1="0" y1="0" x2="1" y2="0.6">
					<stop offset="0" stopColor="currentColor" stopOpacity="0" />
					<stop offset="0.5" stopColor="currentColor" stopOpacity="0.22" />
					<stop offset="1" stopColor="currentColor" stopOpacity="0" />
				</linearGradient>
				<clipPath id={ clipId }>
					<rect x="35" y="22" width="42" height="28" rx="3" />
				</clipPath>
			</defs>
			<rect x="34" y="21" width="44" height="30" rx="4" />
			<g className="resource-video-button" fill="currentColor" stroke="none">
				<path d="M51 29L63 36L51 43Z" />
			</g>
			<g className="resource-video-scene" clipPath={ `url(#${ clipId })` }>
				<rect
					className="resource-video-gradient"
					x="0"
					y="22"
					width="112"
					height="28"
					fill={ `url(#${ gradientId })` }
					stroke="none"
				/>
			</g>
			<g className="resource-video-timeline">
				<path d="M42 46H70" strokeOpacity="0.25" strokeWidth="1" />
				<path className="resource-video-progress" d="M42 46H70" pathLength="1" strokeWidth="1" />
				<circle
					className="resource-video-playhead"
					cx="42"
					cy="46"
					r="1.5"
					fill="currentColor"
					stroke="none"
				/>
			</g>
		</>
	);
}

const getIllustrations = ( clipId: string ): Record< string, ReactNode > => ( {
	Video: <VideoIllustration />,
	Guide: (
		<>
			<ellipse
				cx="56"
				cy="58"
				rx="17"
				ry="3"
				fill="currentColor"
				fillOpacity="0.12"
				stroke="none"
			/>
			<path d="M49 57q0-3-2-5m2 5q1-3 3-4m9 4q0-4 2-6m-2 6q3-2 5-2" strokeWidth="1" />
			<path d="M56 18V22M56 31V35M56 44V56" />
			<g className="resource-guide-sign" strokeWidth="1.2">
				<path d="M43 22H65L71 26.5L65 31H43Q41 31 41 29V24Q41 22 43 22Z" />
				<g strokeWidth="0.7" strokeOpacity="0.65">
					<path d="M44 25q5-1 9 0t11 0M44 28q4 1 7 0t8 0" />
					<ellipse cx="62" cy="28" rx="2" ry="0.8" />
				</g>
			</g>
			<g className="resource-guide-sign resource-guide-sign-return">
				<path d="M69 35H47L41 39.5L47 44H69Q71 44 71 42V37Q71 35 69 35Z" strokeWidth="1.2" />
				<g strokeWidth="0.7" strokeOpacity="0.65">
					<path d="M48 38q4-1 8 0t12 0M54 41q4-1 7 0t7 0" />
					<ellipse cx="49" cy="41" rx="2" ry="0.8" />
				</g>
			</g>
		</>
	),
	Checklist: (
		<>
			<path d="M50 17h-5q-4 0-4 4v30q0 4 4 4h22q4 0 4-4V21q0-4-4-4h-5" />
			<rect x="50" y="14" width="12" height="6" rx="2" />
			<defs>
				<clipPath id={ `${ clipId }-clipboard` }>
					<path d="M42 18H49V21H63V18H70V52H42Z" />
				</clipPath>
			</defs>
			<g clipPath={ `url(#${ clipId }-clipboard)` }>
				<g className="resource-check-rows">
					{ [ 10, 20, 30, 40, 50, 60 ].map( ( y, index ) => (
						<g key={ y }>
							<path
								className={ index === 4 ? 'resource-check-new' : undefined }
								pathLength="1"
								d={ `M53 ${ y + 6 }l2 2 4-5` }
							/>
						</g>
					) ) }
				</g>
			</g>
		</>
	),
	'Slide deck': (
		<>
			<rect x="34" y="20" width="44" height="29" rx="4" />
			<path d="M56 49V56M48 56H64" />
			<svg x="35" y="21" width="42" height="27" viewBox="35 21 42 27" overflow="hidden">
				<g className="resource-slide-content" strokeWidth="1">
					{ [ 0, 1, 2, 0 ].map( ( slide, index ) => (
						<g key={ index } transform={ `translate(${ index * 44 } 0)` }>
							{ slide === 0 ? (
								<>
									<path d="M44 30h24m-24 4h19" strokeWidth="1.2" />
									<path d="M48 40h16" strokeWidth="0.7" />
								</>
							) : null }
							{ slide === 1 ? (
								<>
									<path d="M42 26H61" strokeWidth="1.2" />
									<rect x="42" y="31" width="12" height="11" rx="1" />
									<path d="m43 40 3-4 3 3 2-2 2 3M58 32h12m-12 4h12m-12 4h8" />
									<circle cx="50" cy="34" r="1" />
								</>
							) : null }
							{ slide === 2 ? (
								<>
									<path d="M42 26H61" strokeWidth="1.2" />
									<path d="M42 31v11h14m-12-3 4-5 3 2 4-5M60 32h10m-10 4h10m-10 4h7" />
								</>
							) : null }
						</g>
					) ) }
				</g>
			</svg>
		</>
	),
	'One-pager': (
		<>
			<path d="M44 15H63L72 24V53Q72 57 68 57H44Q40 57 40 53V19Q40 15 44 15Z" />
			<path d="M63 15v5q0 4 4 4h5" />
			<defs>
				<clipPath id={ `${ clipId }-paper` }>
					<path d="M41 16H62V21Q62 25 67 25H71V56H41Z" />
				</clipPath>
			</defs>
			<g clipPath={ `url(#${ clipId }-paper)` }>
				<g className="resource-paper-lines" strokeWidth="1">
					<path d="M47 25h9" strokeWidth="1.2" />
					<rect x="47" y="30" width="18" height="9" rx="1" />
					<circle cx="61" cy="33" r="1" />
					<path d="m48 38 5-5 4 4 3-2 4 3M47 43h18m-18 4h18m-18 4h12" />
					{ [ 55, 59, 63, 67 ].map( ( y, index ) => (
						<path
							key={ y }
							className={ `resource-paper-new-line resource-paper-line-${ index + 1 }` }
							pathLength="18"
							d={ `M47 ${ y }h${ index === 3 ? 12 : 18 }` }
						/>
					) ) }
				</g>
			</g>
		</>
	),
	'Talk track': (
		<>
			<path d="M44 20H68Q76 20 76 28V40Q76 48 68 48H54L44 56V48Q36 48 36 40V28Q36 20 44 20Z" />
			<g fill="currentColor" stroke="none">
				{ [ 48, 56, 64 ].map( ( x, index ) => (
					<circle
						key={ x }
						className={ `resource-talk-dot resource-talk-dot-${ index }` }
						cx={ x }
						cy="34"
						r="1.2"
					/>
				) ) }
			</g>
		</>
	),
	'Case study': (
		<>
			<path d="M37 20V49Q37 53 41 53H76" />
			<svg x="42" y="22" width="34" height="26" viewBox="42 22 34 26" overflow="hidden">
				<path
					className="resource-trend-line"
					d="M42 45C48 45 48 37 54 37C60 37 60 32 66 32C72 32 72 45 78 45C84 45 84 37 90 37C96 37 96 32 102 32C108 32 108 45 114 45"
					strokeWidth="1.2"
					strokeOpacity="0.55"
					strokeDasharray="3 2"
				/>
				<path
					className="resource-trend-line"
					d="M42 40C48 40 48 26 54 26C60 26 60 44 66 44C72 44 72 40 78 40C84 40 84 26 90 26C96 26 96 44 102 44C108 44 108 40 114 40"
				/>
			</svg>
		</>
	),
} );

export default function ResourceThumbnail( { contentType }: { contentType: ResourceContentType } ) {
	const clipId = useId();
	const illustrations = getIllustrations( clipId );
	const fallbackType = contentType === 'Webinar' ? 'Video' : 'One-pager';
	const illustrationType = illustrations[ contentType ] ? contentType : fallbackType;
	return (
		<svg
			className="resource-thumbnail"
			viewBox="84 44 56 56"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<g transform="translate(56 36)">
				<g className="resource-fallback-icon">{ illustrations[ illustrationType ] }</g>
			</g>
		</svg>
	);
}
