import { SVG, Path } from '@wordpress/components';

type TransferIconProps = {
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
	className?: string;
};

export default function TransferIcon( {
	width = 24,
	height = 24,
	style,
	className,
}: TransferIconProps ) {
	return (
		<SVG
			width={ width }
			height={ height }
			viewBox="0 0 24 24"
			style={ style }
			className={ className }
			aria-hidden="true"
			focusable="false"
			fill="none"
		>
			<Path
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
				stroke="#757575"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<Path
				d="M14.5 16.5L16.5 14H7.49991M9.49999 7.5L7.49999 10H16.5001"
				stroke="#757575"
				strokeWidth="1.5"
				strokeLinejoin="bevel"
			/>
		</SVG>
	);
}
