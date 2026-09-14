export default function getNormalizedSliderSelection(
	selectedIndex: number,
	minimumIndex: number,
	optionCount: number
): number {
	if ( selectedIndex < 0 || selectedIndex >= minimumIndex || minimumIndex >= optionCount ) {
		return selectedIndex;
	}

	return minimumIndex;
}
