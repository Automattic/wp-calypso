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
				d="M7.00005 7.2H15.2L13.5 9L14.6 10.1L18.2 6.5L14.7 2.5L13.6 3.5L15.5 5.8H7.00005C6.10005 5.8 5.30005 6.1 4.70005 6.7C3.30005 8.2 3.30005 10.9 3.30005 12.3V12.5H4.80005V12.2C4.80005 11.1 4.80005 8.7 5.80005 7.7C6.10005 7.4 6.50005 7.2 7.00005 7.2ZM20.8 11.2V11H19.3V11.3C19.3 12.4 19.3 14.8 18.3 15.8C18 16.1 17.6 16.3 17 16.3H8.80005L10.5 14.6L9.40005 13.5L5.90005 17L9.40005 21L10.5 20L8.60005 17.7H17C17.9 17.7 18.7 17.4 19.3 16.8C20.8 15.4 20.8 12.6 20.8 11.2Z"
				fill="currentColor"
			/>
		</SVG>
	);
}
