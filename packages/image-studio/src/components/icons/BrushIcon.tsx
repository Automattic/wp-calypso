import type { BaseIconProps } from './types';

export function BrushIcon( { className, size = 24 }: BaseIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
			aria-hidden="true"
		>
			<path
				d="M20.707 5.293a1 1 0 0 1 0 1.414l-8.586 8.586a1 1 0 0 1-.391.242l-3.536 1.06a.5.5 0 0 1-.632-.632l1.06-3.535a1 1 0 0 1 .243-.391l8.586-8.586a1 1 0 0 1 1.414 0l1.842 1.842Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M7 14.5c-1.5.5-3 2-3.5 4.5 2.5-.5 4-2 4.5-3.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M15 7l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}
