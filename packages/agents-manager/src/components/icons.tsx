import { Path, Rect, SVG } from '@wordpress/primitives';

interface IconProps {
	size?: number;
	color?: string;
	className?: string;
}

export const AI = ( { size = 24, color = 'currentColor', className }: IconProps ) => {
	return (
		<SVG
			className={ className }
			width={ size }
			height={ size }
			viewBox="3 3 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<Path
				d="M18.7035 11.5821L15.8309 10.5912C14.6949 10.2009 13.7991 9.30509 13.4088 8.16908L12.4179 5.29651C12.2828 4.90116 11.7172 4.90116 11.5821 5.29651L10.5912 8.16908C10.2009 9.30509 9.30509 10.2009 8.16908 10.5912L5.29651 11.5821C4.90116 11.7172 4.90116 12.2828 5.29651 12.4179L8.16908 13.4088C9.30509 13.7991 10.2009 14.6949 10.5912 15.8309L11.5821 18.7035C11.7172 19.0988 12.2828 19.0988 12.4179 18.7035L13.4088 15.8309C13.7991 14.6949 14.6949 13.7991 15.8309 13.4088L18.7035 12.4179C19.0988 12.2828 19.0988 11.7172 18.7035 11.5821ZM15.3505 12.2127L13.9142 12.7081C13.3437 12.9033 12.8983 13.3537 12.7031 13.9192L12.2077 15.3555C12.1376 15.5557 11.8574 15.5557 11.7873 15.3555L11.2919 13.9192C11.0967 13.3487 10.6463 12.9033 10.0808 12.7081L8.6445 12.2127C8.44433 12.1426 8.44433 11.8624 8.6445 11.7923L10.0808 11.2969C10.6513 11.1017 11.0967 10.6513 11.2919 10.0858L11.7873 8.64951C11.8574 8.44933 12.1376 8.44933 12.2077 8.64951L12.7031 10.0858C12.8983 10.6563 13.3487 11.1017 13.9142 11.2969L15.3505 11.7923C15.5507 11.8624 15.5507 12.1426 15.3505 12.2127Z"
				fill={ color }
			/>
		</SVG>
	);
};

export const Minimize = ( { size = 24, color = 'currentColor', className }: IconProps ) => {
	return (
		<SVG
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill={ color }
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<Rect x="5" y="17.5" width="14" height="1.5" />
		</SVG>
	);
};

export const SwitchToFloating = ( {
	size = 24,
	color = 'currentColor',
	className,
}: IconProps ) => {
	return (
		<SVG
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<Path
				d="M18 4C19.1046 4 20 4.89543 20 6V9H18.5V6C18.5 5.72386 18.2761 5.5 18 5.5H6C5.72386 5.5 5.5 5.72386 5.5 6V18C5.5 18.2761 5.72386 18.5 6 18.5H9V20H6L5.7959 19.9893C4.78722 19.887 4 19.0357 4 18V6C4 4.89543 4.89543 4 6 4H18Z"
				fill={ color }
			/>
			{ /* Explicit fill="none": wp's `svg { fill: currentColor }` would
			     otherwise flood the stroked rect. */ }
			<Rect
				x="10.75"
				y="10.75"
				width="8.5"
				height="8.5"
				rx="1.25"
				fill="none"
				stroke={ color }
				strokeWidth="1.5"
			/>
		</SVG>
	);
};

export const SwitchToSidebar = ( {
	size = 24,
	color = 'currentColor',
	className,
}: IconProps ) => {
	return (
		<SVG
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M18 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V6C20 4.9 19.1 4 18 4ZM11.25 18.5H6C5.7 18.5 5.5 18.3 5.5 18V6C5.5 5.7 5.7 5.5 6 5.5H11.25V18.5ZM18.5 18C18.5 18.3 18.3 18.5 18 18.5H12.75V5.5H18C18.3 5.5 18.5 5.7 18.5 6V18Z"
				fill={ color }
			/>
		</SVG>
	);
};
