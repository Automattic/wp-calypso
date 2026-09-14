interface Props {
	viewBox?: string;
	/**
	 * When true, render the glyph as a solid silhouette (no stroke). The
	 * outlined variant is the legacy look used at the top-level sidebar
	 * slots; the filled variant reads better at small sizes (badges,
	 * inline chips, etc.) where the outline stroke loses fidelity.
	 */
	filled?: boolean;
}

export function ReaderBlueskyIcon( { viewBox = '-3 -3 30 30', filled = false }: Props ) {
	return (
		<svg
			className="sidebar__menu-icon sidebar_svg-atmosphere"
			height="24"
			viewBox={ viewBox }
			width="24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M21.2 3.3C20.7 3.1 19.8 2.8 17.6 4.3C15.4 6 12.9 9.2 12 11C11.1 9.2 8.6 6 6.3 4.3C4.1 2.7 3.3 3 2.7 3.3C2.1 3.6 2 4.6 2 5.1C2 5.6 2.3 9.8 2.5 10.5C3.2 12.8 5.6 13.6 7.8 13.3C4.5 13.8 1.6 15 5.4 19.2C9.6 23.5 11.1 18.3 11.9 15.6C12.7 18.3 13.6 23.3 18.3 19.2C21.9 15.6 19.3 13.8 16 13.3C18.2 13.5 20.6 12.8 21.3 10.5C21.7 9.8 22 5.7 22 5.1C22 4.6 21.9 3.6 21.2 3.3Z"
				fill={ filled ? 'currentColor' : 'none' }
				stroke={ filled ? 'none' : 'currentColor' }
				strokeWidth={ filled ? undefined : 1.5 }
				strokeLinejoin={ filled ? undefined : 'round' }
			/>
		</svg>
	);
}
