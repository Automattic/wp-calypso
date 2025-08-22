import type { BaseIconProps } from './types';

export function CheckIcon( { className, size = 24 }: BaseIconProps ) {
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
				d="M16.5 7L10.2 15.5L6.9 13L6 14.2L10.5 17.6L17.7 7.9L16.5 7Z"
				fill="currentColor"
			/>
		</svg>
	);
}
