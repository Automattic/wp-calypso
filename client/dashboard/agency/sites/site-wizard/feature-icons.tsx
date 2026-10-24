import type { ReactNode } from 'react';

function featureIcon( symbol: ReactNode ) {
	return (
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<g
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{ symbol }
			</g>
		</svg>
	);
}

export const hostingIcons = {
	connect: featureIcon(
		<>
			<path d="M17 9.5c0 3.5-5 9.5-5 9.5S7 13 7 9.5a5 5 0 0 1 10 0Z" />
			<circle cx="12" cy="9.5" r="1.25" fill="currentColor" stroke="none" />
		</>
	),
	move: featureIcon( <path d="M5 8h14m-3-3 3 3-3 3M19 16H5m3-3-3 3 3 3" /> ),
	create: featureIcon(
		<path d="M13 5H8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9l-4-4ZM13 5v4h4" />
	),
};

export const featureIcons = {
	hosting: featureIcon(
		<>
			<rect x="5" y="5" width="14" height="14" rx="1.5" />
			<path d="M5 12h14" />
			<g fill="currentColor" stroke="none">
				<circle cx="8.5" cy="8.5" r="1" />
				<circle cx="8.5" cy="15.5" r="1" />
			</g>
		</>
	),
	sites: featureIcon(
		<>
			<path d="M15 5H6a1 1 0 0 0-1 1v10" />
			<rect x="8" y="8" width="11" height="11" rx="1" />
		</>
	),
	migration: featureIcon(
		<>
			<path d="M5 11a7 7 0 0 1 14 0M19 16a3 3 0 0 1-3 3h-2" />
			<rect x="5" y="11" width="3" height="5" rx="1" />
			<rect x="16" y="11" width="3" height="5" rx="1" />
		</>
	),
};
