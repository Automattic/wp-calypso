import type { BaseIconProps } from './types';

export function AlertTriangleIcon( { className, size = 18 }: BaseIconProps ) {
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
			<path
				d="M9.56279 13.0952H8.43779V11.9702H9.56279V13.0952Z"
				fill="currentColor"
			/>
			<path
				d="M8.43779 10.8452H9.56279V7.0952L8.43779 7.0952V10.8452Z"
				fill="currentColor"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.85634 3.48153C8.35812 2.58949 9.64245 2.58949 10.1442 3.48153L15.6118 13.2017C16.104 14.0767 15.4717 15.1577 14.4679 15.1577H3.53267C2.52884 15.1577 1.89659 14.0767 2.38873 13.2017L7.85634 3.48153ZM9.16371 4.03308C9.09203 3.90564 8.90855 3.90564 8.83686 4.03308L3.36925 13.7533C3.29895 13.8783 3.38927 14.0327 3.53267 14.0327H14.4679C14.6113 14.0327 14.7016 13.8783 14.6313 13.7533L9.16371 4.03308Z"
				fill="currentColor"
			/>
		</svg>
	);
}
