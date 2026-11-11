import type { BaseIconProps } from './types';

export function PageIcon( { className, size = 24 }: BaseIconProps ) {
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
			<path d="M14 15.5H8V14H14V15.5Z" fill="currentColor" />
			<path d="M16 12.5H8V11H16V12.5Z" fill="currentColor" />
			<path d="M16 9.5H8V8H16V9.5Z" fill="currentColor" />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M17 4C18.1046 4 19 4.89543 19 6V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V6C5 4.89543 5.89543 4 7 4H17ZM7 5.5C6.72386 5.5 6.5 5.72386 6.5 6V18C6.5 18.2761 6.72386 18.5 7 18.5H17C17.2761 18.5 17.5 18.2761 17.5 18V6C17.5 5.72386 17.2761 5.5 17 5.5H7Z"
				fill="currentColor"
			/>
		</svg>
	);
}
