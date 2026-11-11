import type { BaseIconProps } from './types';

export function ImageIcon( { className, size = 24 }: BaseIconProps ) {
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M17 6.5H7C6.72386 6.5 6.5 6.72386 6.5 7V17C6.5 17.2761 6.72386 17.5 7 17.5H17C17.2761 17.5 17.5 17.2761 17.5 17V7C17.5 6.72386 17.2761 6.5 17 6.5ZM7 5C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14.4772 10.4623C14.7683 10.1792 15.2317 10.1792 15.5228 10.4623L18.5228 14.3511L17.4772 15.4266L15 12.046L12.5228 15.4266C12.2719 15.6706 11.8857 15.7086 11.5921 15.5183L8.59643 13.5766L6.44186 16.606L5.55811 15.394L8.12953 12.0607C8.38061 11.8776 8.71858 11.8683 8.97934 12.0373L11.906 13.9342L14.4772 10.4623Z"
				fill="currentColor"
			/>
		</svg>
	);
}
