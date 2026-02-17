export default function ReaderAddIcon( { size = 20 } ) {
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-add"
			fill="none"
			height={ size }
			viewBox={ `1 -2 ${ size } ${ size }` }
			width={ size }
			xmlns="http://www.w3.org/2000/svg"
		>
			<g>
				<path d="m9.25 4h1.5v12h-1.5z" />
				<path d="m16 9.25h1.5v12h-1.5z" transform="matrix(0 1 -1 0 25.25 -6.75)" />
			</g>
		</svg>
	);
}
