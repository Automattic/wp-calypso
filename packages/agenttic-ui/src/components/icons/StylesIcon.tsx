import type { BaseIconProps } from './types';

export function StylesIcon( { className, size = 24 }: BaseIconProps ) {
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
				d="M19 12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12C5 10.1435 5.7375 8.36301 7.05025 7.05025C8.36301 5.7375 10.1435 5 12 5C13.8565 5 15.637 5.7375 16.9497 7.05025C18.2625 8.36301 19 10.1435 19 12ZM17.6875 12C17.6875 13.5084 17.0883 14.9551 16.0217 16.0217C14.9551 17.0883 13.5084 17.6875 12 17.6875V6.3125C13.5084 6.3125 14.9551 6.91172 16.0217 7.97833C17.0883 9.04494 17.6875 10.4916 17.6875 12Z"
				fill="currentColor"
			/>
		</svg>
	);
}
