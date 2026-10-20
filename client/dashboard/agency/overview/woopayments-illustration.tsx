import { SVG, Rect, Path, Circle } from '@wordpress/primitives';

/**
 * Two stacked SVG layers, both stretched to the callout's image panel: the dot
 * pattern tiles at a fixed density so it fills any panel size, while the
 * storefront art scales to fit (never crops), centered in the panel.
 */
export default function WooPaymentsIllustration( { title }: { title?: string } ) {
	return (
		<>
			<SVG aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="pattern0_woopayments" patternUnits="userSpaceOnUse" width="6" height="6">
						<image
							width="12"
							height="12"
							transform="scale(0.5)"
							preserveAspectRatio="none"
							xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGklEQVR4nGNgGAUo4D82QSYCirFqIsmG4QAAKKwD//0jFGoAAAAASUVORK5CYII="
						/>
					</pattern>
				</defs>
				<Rect width="100%" height="100%" fill="url(#pattern0_woopayments)" fillOpacity="0.12" />
			</SVG>
			<SVG
				viewBox="-2 30 294 152"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMidYMid meet"
			>
				{ title && <title>{ title }</title> }
				<Rect x="68" y="82" width="104" height="74" rx="4.62" fill="white" stroke="#C3C4C7" />
				<Rect x="44" y="100" width="32" height="56" rx="4.62" fill="white" stroke="#C3C4C7" />
				<Rect
					x="105"
					y="56"
					width="141"
					height="100"
					rx="4.62"
					fill="white"
					stroke="url(#paint0_linear_woopayments)"
				/>
				<Circle cx="113" cy="65" r="2" stroke="#C3C4C7" />
				<Circle cx="121.172" cy="65" r="2" stroke="#C3C4C7" />
				<Circle cx="129.34" cy="65" r="2" stroke="#C3C4C7" />
				<Rect x="163" y="94" width="24" height="24" rx="2" fill="#7A00DF" />
				<Path
					d="M171.5 111C170.7 111 170 111.7 170 112.5C170 113.3 170.7 114 171.5 114C172.3 114 173 113.3 173 112.5C173 111.7 172.3 111 171.5 111ZM178.5 111C177.7 111 177 111.7 177 112.5C177 113.3 177.7 114 178.5 114C179.3 114 180 113.3 180 112.5C180 111.7 179.3 111 178.5 111ZM172.5 107.2H177.6C178.8 107.2 179.8 106.5 180.2 105.4L181.5 101.9C181.8 101.1 181.2 100.2 180.3 100.2H170.3L169.5 98.2H166.5V99.7H168.5L171.2 106.4L170.6 107.7C170 108.9 170.9 110.2 172.2 110.2H180.6V108.7H172.2C172 108.7 171.9 108.5 172 108.3L172.6 107.2H172.5Z"
					fill="white"
				/>
				<defs>
					<linearGradient
						id="paint0_linear_woopayments"
						x1="114.895"
						y1="96"
						x2="233.667"
						y2="96.5597"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#3858E9" />
						<stop offset="1" stopColor="#069E08" />
					</linearGradient>
				</defs>
			</SVG>
		</>
	);
}
