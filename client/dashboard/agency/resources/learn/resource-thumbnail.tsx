import { useId } from 'react';

function VideoIllustration() {
	const id = useId();
	const gradientId = `${ id }-gradient`;
	const clipId = `${ id }-frame`;
	return (
		<>
			<defs>
				<linearGradient id={ gradientId }>
					<stop offset="0" stopColor="currentColor" stopOpacity="0" />
					<stop offset="0.5" stopColor="currentColor" stopOpacity="0.18" />
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
					className="resource-video-wipe"
					x="35"
					y="22"
					width="84"
					height="28"
					fill={ `url(#${ gradientId })` }
					stroke="none"
				/>
			</g>
			<g className="resource-video-timeline">
				<path d="M42 45H70" strokeOpacity="0.25" />
				<path className="resource-video-progress" d="M42 45H70" pathLength="1" />
				<circle
					className="resource-video-playhead"
					cx="42"
					cy="45"
					r="2.5"
					fill="currentColor"
					stroke="none"
				/>
			</g>
		</>
	);
}

const illustrations = {
	Video: <VideoIllustration />,
	Guide: (
		<>
			<path d="M56 18V22M56 31V35M56 44V56" />
			<path
				className="resource-guide-sign"
				d="M43 22H65L71 26.5L65 31H43Q41 31 41 29V24Q41 22 43 22Z"
			/>
			<path d="M69 35H47L41 39.5L47 44H69Q71 44 71 42V37Q71 35 69 35Z" />
		</>
	),
	Checklist: (
		<>
			<rect x="41" y="17" width="30" height="38" rx="4" />
			<svg x="45" y="21" width="22" height="28" viewBox="45 21 22 28" overflow="hidden">
				<g className="resource-check-rows">
					<path d="m51 28 3 3 7-8m-10 19 3 3 7-8" />
					<path className="resource-check-new" pathLength="1" d="m51 56 3 3 7-8" />
				</g>
			</svg>
		</>
	),
	'Slide deck': (
		<>
			<rect x="34" y="20" width="44" height="29" rx="4" />
			<path d="M56 49V56M48 56H64" />
			<svg x="40" y="23" width="32" height="19" viewBox="40 23 32 19" overflow="hidden">
				<g className="resource-slide-content" strokeWidth="1.5">
					{ [ 0, 1 ].map( ( slide ) => (
						<g key={ slide } transform={ `translate(${ slide * 36 } 0)` }>
							<path d="M44 29H66M44 35H59" />
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
			<path d="M47 25h9" />
			<svg x="46" y="31" width="20" height="20" viewBox="46 31 20 20" overflow="hidden">
				<g className="resource-paper-lines">
					<path d="M47 34h18M47 41h18M47 48h18" />
					<path className="resource-paper-new-line" pathLength="18" d="M47 55h18" />
				</g>
			</svg>
		</>
	),
	'Talk track': (
		<>
			<path
				className="resource-speech-bubble"
				d="M38 21H74Q78 21 78 25V45Q78 49 74 49H53L44 56Q42 58 42 55V49H38Q34 49 34 45V25Q34 21 38 21Z"
			/>
			<circle
				className="resource-speech-dot resource-dot-first"
				cx="46"
				cy="35"
				r="2"
				fill="currentColor"
				stroke="none"
			/>
			<circle
				className="resource-speech-dot resource-dot-second"
				cx="56"
				cy="35"
				r="2"
				fill="currentColor"
				stroke="none"
			/>
			<circle
				className="resource-speech-dot resource-dot-third"
				cx="66"
				cy="35"
				r="2"
				fill="currentColor"
				stroke="none"
			/>
		</>
	),
	'Case study': (
		<>
			<path d="M37 20V49Q37 53 41 53H76" />
			<svg x="42" y="22" width="34" height="26" viewBox="42 22 34 26" overflow="hidden">
				<path
					className="resource-trend-line"
					d="M42 40C48 40 48 26 54 26C60 26 60 44 66 44C72 44 72 40 78 40C84 40 84 26 90 26C96 26 96 44 102 44C108 44 108 40 114 40"
				/>
			</svg>
		</>
	),
};

export default function ResourceThumbnail( { format }: { format: string } ) {
	return (
		<svg
			className="resource-thumbnail"
			viewBox="84 44 56 56"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<g transform="translate(56 36)">
				<g className="resource-fallback-icon">
					{ illustrations[ format as keyof typeof illustrations ] ?? illustrations.Guide }
				</g>
			</g>
		</svg>
	);
}
