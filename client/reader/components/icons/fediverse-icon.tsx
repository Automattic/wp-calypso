interface Props {
	/**
	 * Override the default viewBox to control how tightly the asterism
	 * fills its rendered slot. The glyph paints inside roughly
	 * `(5, 3) → (19, 21)` of the default 24-unit canvas, so a viewBox of
	 * `"4 3 16 18"` makes it fill the slot edge-to-edge — useful for
	 * larger displays like the chooser cards. Defaults to the looser
	 * `"0 0 24 24"` that matches the sibling brand icons' slot padding.
	 */
	viewBox?: string;
}

/**
 * Renders the asterism glyph (U+2042) inside a 24×24 SVG so it slots into
 * sidebar slots that expect a `sidebar__menu-icon`-classed inline SVG, the
 * same shape used by the bluesky and mastodon sidebar icons.
 */
export function ReaderFediverseIcon( { viewBox = '0 0 24 24' }: Props = {} ) {
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-fediverse"
			height="24"
			width="24"
			viewBox={ viewBox }
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
