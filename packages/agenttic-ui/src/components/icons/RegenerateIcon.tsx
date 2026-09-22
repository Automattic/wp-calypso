import type { BaseIconProps } from './types';

export function RegenerateIcon( { className, size = 24 }: BaseIconProps ) {
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
				fill="currentColor"
				d="M11.98 21c-4.96 0-9-4.04-9-9s4.04-9 9-9c2.54 0 4.53.88 6.52 2.91V4c0-.41.34-.75.75-.75s.75.34.75.75v4c0 .41-.34.75-.75.75h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.46c-1.8-1.95-3.48-2.75-5.73-2.75-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5c3.57 0 4.49-.76 5.33-1.76.27-.32.74-.36 1.06-.09.32.27.36.74.09 1.06-1.22 1.46-2.68 2.3-6.48 2.3Z"
			/>
			<path
				fill="currentColor"
				d="m14 9-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Zm6.5 3-.83 1.67-1.67.83 1.67.83.83 1.67.83-1.67L23 14.5l-1.67-.83L20.5 12Z"
			/>
		</svg>
	);
}
