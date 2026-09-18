import type { BaseIconProps } from './types';

export function ChevronRightIcon( { className, size = 24 }: BaseIconProps ) {
	return (
		<svg
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10.5549 5.9955L16.0136 12L10.5549 18.0045L9.44504 16.9955L13.9864 12L9.44504 7.00451L10.5549 5.9955Z"
				fill="currentColor"
			/>
		</svg>
	);
}
