import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import type { CSSProperties } from 'react';

// Domains and emails are LTR identifiers; force LTR and isolate them so RTL locales don't
// reverse the head/tail order. `overflow: hidden` is the final clip if even the tail can't fit.
const wrapperStyle: CSSProperties = {
	maxWidth: '100%',
	minWidth: 0,
	overflow: 'hidden',
	direction: 'ltr',
	unicodeBidi: 'isolate',
};
const ellipsis: CSSProperties = {
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};
// The head absorbs the shrink first (high flex-shrink), so the pinned tail is only forced to
// truncate as a last resort, once the head has fully collapsed.
const headStyle: CSSProperties = { ...ellipsis, flexShrink: 999 };
// If the tail must truncate, clip it from the start (direction: rtl) so the TLD suffix survives;
// the inner <bdi> keeps the text in its natural LTR order.
const tailStyle: CSSProperties = { ...ellipsis, direction: 'rtl' };

interface MiddleTruncateProps {
	/** The text to display, e.g. "my.shop.domain.co.jp" or "me@example.com". */
	text?: string;
	/**
	 * Convenience alias for `text` so the component can be dropped straight into a
	 * `createInterpolateElement` mapping, where the value arrives as element children.
	 */
	children?: string;
	/**
	 * The registrable (root) domain of `text`, when the caller already knows it (e.g. from the
	 * API). It is kept whole as the pinned suffix, which handles multi-level public suffixes like
	 * `co.jp` correctly. Without it, the tail falls back to the last dot — enough to keep the TLD,
	 * and free of any public-suffix table so this component stays cheap in shared bundles.
	 */
	rootDomain?: string;
	className?: string;
}

/**
 * Picks the index from which the tail should stay pinned — the most identifiable end of an
 * identifier, so the truncated middle never eats it:
 *
 * - Email: the domain, from the `@` (`me@example.com` → pins `@example.com`).
 * - Domain under a known root: the whole registrable domain (`my.shop.domain.co.jp` with root
 *   `domain.co.jp` → pins `.domain.co.jp`).
 * - Otherwise: the last dot, which still keeps the TLD (`myverylongstore.com` → pins `.com`).
 *
 * Returns -1 when there is no natural boundary to pin (e.g. a value with no dot).
 */
function getTailStart( value: string, rootDomain?: string ): number {
	const at = value.lastIndexOf( '@' );
	if ( at > 0 ) {
		return at;
	}

	if ( rootDomain && value.length > rootDomain.length && value.endsWith( rootDomain ) ) {
		// Pin the whole registrable domain, dropping the subdomain into the head.
		return value.length - rootDomain.length - 1;
	}

	const dot = value.lastIndexOf( '.' );
	return dot > 0 ? dot : -1;
}

/**
 * Displays a string on a single line, middle-truncating it with an ellipsis when it runs
 * out of horizontal space. The beginning stays visible along with a pinned, identifiable
 * suffix — the registrable domain of a domain name (`my.shop.domain.co.jp` → `my.s….domain.co.jp`)
 * or the domain of an email (`myverylongemail@example.com` → `myverylonge…@example.com`) — so
 * the value stays recognizable. The full text is revealed on hover via the title tooltip.
 */
export default function MiddleTruncate( {
	text,
	children,
	rootDomain,
	className,
}: MiddleTruncateProps ) {
	const value = text ?? ( typeof children === 'string' ? children : '' );
	const tailStart = getTailStart( value, rootDomain );
	const head = tailStart > 0 ? value.slice( 0, tailStart ) : value;
	const tail = tailStart > 0 ? value.slice( tailStart ) : '';

	return (
		<HStack
			as="span"
			justify="flex-start"
			spacing={ 0 }
			expanded={ false }
			className={ clsx( 'dashboard-middle-truncate', className ) }
			style={ wrapperStyle }
			title={ value }
		>
			<span style={ headStyle }>{ head }</span>
			{ tail && (
				<span style={ tailStyle }>
					<bdi>{ tail }</bdi>
				</span>
			) }
		</HStack>
	);
}
