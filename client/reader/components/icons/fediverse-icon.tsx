/**
 * Renders the asterism glyph (U+2042) inside a 24×24 SVG so it slots into
 * sidebar slots that expect a `sidebar__menu-icon`-classed inline SVG, the
 * same shape used by the bluesky and mastodon sidebar icons.
 */
export function ReaderFediverseIcon() {
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-fediverse"
			height="24"
			width="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<text
				x="12"
				y="12"
				textAnchor="middle"
				dominantBaseline="central"
				fontSize="16"
				fontWeight="700"
				fill="currentColor"
			>
				⁂
			</text>
		</svg>
	);
}
