export const hasScrolledToEnd = ( {
	scrollHeight,
	scrollTop,
	clientHeight,
}: {
	scrollHeight: number;
	scrollTop: number;
	clientHeight: number;
} ) => {
	// NOTE: scrollTop might be fractional in some browsers, so without this Math.abs() trick
	// sometimes the result won't be a whole number, causing the comparison to fail.
	return Math.abs( scrollHeight - clientHeight - scrollTop ) < 1;
};
