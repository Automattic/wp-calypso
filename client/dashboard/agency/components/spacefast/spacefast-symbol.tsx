/**
 * The Spacefast symbol (the S), from the Spacefast Brand Book, cropped to the glyph.
 * Filled with `currentColor` so callers pick white, black, or green.
 */
export default function SpacefastSymbol( { className }: { className?: string } ) {
	return (
		<svg
			className={ className }
			viewBox="35.5 35.3 210 210"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<path
				fill="currentColor"
				d="M144.237 162.275L78.975 156.525C50.225 153.938 37 144.45 37 115.7L37 92.125C37 63.0875 51.375 49 80.125 49L200.875 49C229.625 49 244 63.375 244 92.125V109.375H157.75V97.875L123.25 97.875V99.025C123.25 110.525 124.687 111.388 136.188 112.25L199.15 117.713C227.9 120.013 244 132.663 244 161.413V188.438C244 217.188 229.625 231.563 200.875 231.563L80.125 231.563C51.0875 231.563 37 217.188 37 188.438V165.438H123.25L123.25 182.688L157.75 182.688L157.75 176.075C157.75 164.575 155.738 163.138 144.237 162.275Z"
			/>
		</svg>
	);
}
