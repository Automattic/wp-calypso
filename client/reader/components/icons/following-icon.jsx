export default function ReaderFollowingIcon( { iconSize } ) {
	return (
		<svg
			key="following"
			className="gridicons-reader-following"
			fill="none"
			viewBox="0 0 24 24"
			width={ iconSize }
			height={ iconSize }
			xmlns="http://www.w3.org/2000/svg"
		>
			<mask
				id="mask0_372_400"
				style={ { maskType: 'alpha' } }
				maskUnits="userSpaceOnUse"
				x="3"
				y="3"
				width="21"
				height="19"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M21 11.889L16.545 16.344L14.451 14.168L9.538 19H5C3.9 19 3 18.1 3 17V3H21V11.889ZM16.508 22L24 14.482L22.612 13.106L16.518 19.2L14.412 17.012L13 18.4L16.508 22ZM9 14H5V13H9V14ZM5 12H12V11H5V12ZM12 10H5V9H12V10ZM5 7H19V5H5V7Z"
					fill="white"
				/>
			</mask>
			<g mask="url(#mask0_372_400)">
				<rect x="1" y="-1" width={ iconSize } height={ iconSize } fill="#3C8832" />
			</g>
		</svg>
	);
}
