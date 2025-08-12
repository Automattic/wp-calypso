import { isRTL } from '@wordpress/i18n';
import { SVG, Rect, Path, G, Circle, Stop } from '@wordpress/primitives';

export const DomainUpsellIllustraction = ( {
	title,
	domain,
	search,
}: {
	title?: string;
	domain?: string;
	search: string;
} ) => (
	<SVG
		width="318"
		height="192"
		viewBox="0 0 318 192"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
		preserveAspectRatio="xMinYMin slice"
	>
		{ title && <title>{ title }</title> }
		<G clipPath="url(#clip0_8083_30798)">
			<Rect width="318" height="192" fill="white" />
			<Rect width="318" height="192" fill="url(#pattern0_8083_30798)" fillOpacity="0.12" />
			<Path d="M37 49C37 42.3726 42.3726 37 49 37H325V196H37V49Z" fill="white" />
			<Rect x="51" y="89" width="162" height="20" rx="4" fill="#F7F7F7" />
			<Rect x="51" y="119" width="288" height="90" rx="4" fill="#F7F7F7" />
			<Path d="M37 49C37 42.3726 42.3726 37 49 37H325V75H37V49Z" fill="#F7F7F7" />
			<Circle cx="55" cy="56" r="3.25" fill="#F7F8FE" stroke="#C3C4C7" strokeWidth="1.5" />
			<Circle cx="67" cy="56" r="3.25" fill="#F7F8FE" stroke="#C3C4C7" strokeWidth="1.5" />
			<Circle cx="79" cy="56" r="3.25" fill="#F7F8FE" stroke="#C3C4C7" strokeWidth="1.5" />
			<Rect x="95" y="45" width="240" height="22" rx="4" fill="white" />
			<text
				x={ isRTL() ? -119 : 119 }
				y="60"
				textAnchor={ isRTL() ? 'end' : 'start' }
				direction="ltr"
				fill="#1E1E1E"
				fontSize="12px"
				{ ...( ! domain ? { filter: 'blur(0.3em)', opacity: 0.5 } : {} ) }
			>
				{ domain ?? search }
			</text>
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M109.25 55.25H109.1V53.75C109.1 52.625 108.2 51.65 107 51.65C105.8 51.65 104.9 52.625 104.9 53.75V55.25H104.75C104.3 55.25 104 55.55 104 56V59C104 59.45 104.3 59.75 104.75 59.75H109.25C109.7 59.75 110 59.45 110 59V56C110 55.55 109.7 55.25 109.25 55.25ZM107.9 55.25H106.025V53.75C106.025 53.225 106.475 52.85 106.925 52.85C107.375 52.85 107.825 53.3 107.825 53.75V55.25H107.9Z"
				fill="#3858E9"
			/>
			<Path
				d="M325 196H37V49C37 42.3726 42.3726 37 49 37H325V196ZM38 75V195H324V75H38ZM49 38C42.9249 38 38 42.9249 38 49V74H324V38H49Z"
				fill="url(#paint0_linear_8083_30798)"
			/>
		</G>
		<defs>
			<pattern
				id="pattern0_8083_30798"
				patternContentUnits="objectBoundingBox"
				width="0.0188679"
				height="0.03125"
			>
				<use xlinkHref="#image0_8083_30798" transform="scale(0.00157233 0.00260417)" />
			</pattern>
			<linearGradient
				id="paint0_linear_8083_30798"
				x1="302.32"
				y1="59.8261"
				x2="76.018"
				y2="144.39"
				gradientUnits="userSpaceOnUse"
			>
				<Stop stopColor="#069E08" />
				<Stop offset="1" stopColor="#3858E9" />
			</linearGradient>
			<clipPath id="clip0_8083_30798">
				<Rect width="318" height="192" fill="white" />
			</clipPath>
			<image
				id="image0_8083_30798"
				width="12"
				height="12"
				preserveAspectRatio="none"
				xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGklEQVR4nGNgGAUo4D82QSYCirFqIsmG4QAAKKwD//0jFGoAAAAASUVORK5CYII="
			/>
		</defs>
	</SVG>
);
