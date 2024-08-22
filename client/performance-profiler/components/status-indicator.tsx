import { Valuation } from 'calypso/performance-profiler/types/performance-metrics';

type Props = { speed: Valuation };

const innerSvg = {
	good: <rect x="1" y="1" width="10" height="10" rx="5" fill="#00BA37" />,
	needsImprovement: (
		<path
			d="M5.56292 0.786741C5.75342 0.443836 6.24658 0.443837 6.43708 0.786742L11.5873 10.0572C11.7725 10.3904 11.5315 10.8 11.1502 10.8H0.849757C0.468515 10.8 0.227531 10.3904 0.412679 10.0572L5.56292 0.786741Z"
			fill="#D67709"
		/>
	),
	bad: <rect x="1" y="1" width="10" height="10" rx="2" fill="#D63638" />,
	unknown: <rect x="1.5" y="1.5" width="9" height="9" rx="4.5" stroke="#DCDCDE" />,
};
export const StatusIndicator = ( { speed }: Props ) => {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
			{ innerSvg[ speed ] }
		</svg>
	);
};
