export default function ReaderNotificationsIcon( { size = 20, viewBox = '0 0 20 20' } ) {
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-notifications"
			fill="none"
			height={ size }
			viewBox={ viewBox }
			width={ size }
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M5 6.5C5 3.73858 7.23858 1.5 10 1.5V1.5C12.7614 1.5 15 3.73858 15 6.5V11.86L17.5 14.5H2.5L5 11.86V6.5Z"
				stroke="#A2AAB2"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
			<path
				d="M12 16.5C12 17.6046 11.1046 18.5 10 18.5C8.89543 18.5 8 17.6046 8 16.5"
				stroke="#A2AAB2"
				strokeWidth="1.5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
