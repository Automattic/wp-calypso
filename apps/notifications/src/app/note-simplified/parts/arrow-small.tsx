import { SVG, Path } from '@wordpress/primitives';

/**
 * A lighter up-right arrow drawn for 16px, after a comment's time.
 */
export default function ArrowSmall( { className }: { className?: string } ) {
	return (
		<SVG
			className={ className }
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<Path
				d="M11.6666 10.0003V4.33366H5.99992M11.3808 4.61939L4.33325 11.667"
				stroke="currentColor"
				strokeLinecap="square"
			/>
		</SVG>
	);
}
