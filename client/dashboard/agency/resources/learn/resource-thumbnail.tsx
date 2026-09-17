import { useState } from 'react';

const illustrations = {
	Video: (
		<>
			<rect x="34" y="21" width="44" height="30" rx="4" />
			<g className="resource-video-button" fill="currentColor" stroke="none">
				<path className="resource-video-left" d="M51 29L57 32.5L57 39.5L51 43Z" />
				<path className="resource-video-right" d="M57 32.5L63 36L63 36L57 39.5Z" />
			</g>
		</>
	),
	Guide: (
		<>
			<path d="M56 25c-8-5-17-5-24-2v28c8-3 16-2 24 2 8-4 16-5 24-2V23c-7-3-16-3-24 2Zm0 0v28" />
			<path
				className="resource-book-page"
				d="M56 25Q68 17 80 23L80 51Q68 48 56 53Z"
				fill="currentColor"
				fillOpacity="0.1"
			/>
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
			<path d="M56 49v7m-8 0h16" />
			<path strokeWidth="2.5" className="resource-chart-bar resource-chart-first" d="M44 40v-7" />
			<path strokeWidth="2.5" className="resource-chart-bar resource-chart-second" d="M56 40V28" />
			<path strokeWidth="2.5" className="resource-chart-bar resource-chart-third" d="M68 40v-9" />
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

export default function ResourceThumbnail( {
	imageUrl,
	format,
	resourceId,
}: {
	imageUrl?: string;
	format: string;
	resourceId: string;
} ) {
	const [ failedUrl, setFailedUrl ] = useState< string >();
	if ( imageUrl && imageUrl !== failedUrl ) {
		return (
			<div className="resource-thumbnail resource-photo-frame">
				<img
					className="resource-thumbnail"
					src={ imageUrl }
					width={ 112 }
					height={ 72 }
					alt=""
					loading="lazy"
					onError={ () => setFailedUrl( imageUrl ) }
				/>
			</div>
		);
	}
	const palette =
		Array.from( resourceId ).reduce( ( sum, char ) => sum + char.charCodeAt( 0 ), 0 ) % 4;
	return (
		<svg
			className="resource-thumbnail resource-thumbnail-fallback"
			data-palette={ palette }
			viewBox="0 0 224 144"
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
