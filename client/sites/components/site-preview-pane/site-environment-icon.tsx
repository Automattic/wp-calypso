/**
 * SiteEnvironmentIcon component
 *
 * Renders an environment icon (Production or Staging) based on the type prop
 */

type EnvironmentType = 'production' | 'staging';

interface SiteEnvironmentIconProps {
	type?: EnvironmentType;
}

export default function SiteEnvironmentIcon( { type = 'production' }: SiteEnvironmentIconProps ) {
	const colors = {
		production: {
			primary: '#4AB866',
			secondary: '#069E08',
		},
		staging: {
			primary: '#F0B849',
			secondary: '#F0B849',
		},
	} as const;

	const { primary, secondary } = colors[ type ];

	return (
		<svg
			className="site-environment-icon"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="4" y="4" width="16" height="16" rx="8" fill={ primary } />
			<rect
				x="5.25"
				y="5.25"
				width="13.5"
				height="13.5"
				rx="6.75"
				stroke="white"
				strokeOpacity="0.6"
				strokeWidth="2.5"
			/>
			<rect x="6" y="6" width="12" height="12" rx="6" fill={ secondary } />
		</svg>
	);
}
