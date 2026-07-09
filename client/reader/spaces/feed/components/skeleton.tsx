import clsx from 'clsx';

/**
 * A single shimmering placeholder block. Layout skeletons compose these (reusing
 * each layout's own card classes) so the loading state matches the card shape.
 */
export function Shimmer( { className }: { className?: string } ) {
	return <span className={ clsx( 'space-feed__shimmer', className ) } aria-hidden="true" />;
}
