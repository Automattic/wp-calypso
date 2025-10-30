import type { BaseIconProps } from './types';

export function AlertCircleIcon( { className, size = 18 }: BaseIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
			role="img"
			aria-label="Alert"
		>
			<path d="M8.4375 12V10.875H9.5625V12H8.4375Z" fill="currentColor" />
			<path
				d="M8.4375 6L8.4375 9.75H9.5625V6L8.4375 6Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3ZM4.125 9C4.125 11.6924 6.30761 13.875 9 13.875C11.6924 13.875 13.875 11.6924 13.875 9C13.875 6.30761 11.6924 4.125 9 4.125C6.30761 4.125 4.125 6.30761 4.125 9Z"
				fill="currentColor"
			/>
		</svg>
	);
}
