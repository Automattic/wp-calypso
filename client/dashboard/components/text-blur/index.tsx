import clsx from 'clsx';
import './style.scss';

/**
 * Keep this mounted and flip `isBlurred` once the real value is known instead of
 * swapping it for another element. Page translators reparent inline nodes, so
 * React inserting or removing elements around translated text throws; changing
 * only the class and text of the same span is safe.
 * A known React issue: react/react#11538
 *
 * Pass `length` when the final text isn't known while loading: the blurred span
 * shows that many placeholder characters instead of `children`.
 */
export function TextBlur( {
	children,
	isBlurred,
	length,
}: {
	children?: React.ReactNode;
	isBlurred: boolean;
	length?: number;
} ) {
	return (
		<span
			className={ clsx( 'dashboard-text-blur', {
				'dashboard-text-blur--is-blurred': isBlurred,
			} ) }
			aria-hidden={ isBlurred || undefined }
		>
			{ isBlurred && length !== undefined ? 'X'.repeat( length ) : children }
		</span>
	);
}
