import { SVG, Path } from '@wordpress/components';

type ConnectIconProps = {
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
	className?: string;
};

export default function ConnectIcon( {
	width = 24,
	height = 24,
	style,
	className,
}: ConnectIconProps ) {
	return (
		<SVG
			width={ width }
			height={ height }
			viewBox="0 0 24 24"
			style={ {
				...style,
				fill: 'none',
			} }
			className={ className }
			aria-hidden="true"
			focusable="false"
			fill="none"
		>
			<Path
				d="M12 17V22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 16.4292 19.1204 20.1859 15.1312 21.5"
				stroke="#757575"
				strokeWidth="1.5"
			/>
			<Path
				d="M9.8695 9.76047L9.86957 7.72559M14.1122 9.76887V7.72641M16.0642 9.94217L7.91806 9.92607L7.91016 13.999L10.4498 17.0587L13.5044 17.0646L16.0561 14.015L16.0642 9.94217Z"
				stroke="#757575"
				strokeWidth="1.5"
				strokeLinecap="square"
			/>
		</SVG>
	);
}
