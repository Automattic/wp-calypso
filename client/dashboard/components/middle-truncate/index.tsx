import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import { getTld } from '../../utils/domain';

import './style.scss';

interface MiddleTruncateProps {
	/** The text to display, e.g. "my.shop.domain.co.jp" or "me@example.com". */
	text?: string;
	/**
	 * Convenience alias for `text` so the component can be dropped straight into a
	 * `createInterpolateElement` mapping, where the value arrives as element children.
	 */
	children?: string;
	className?: string;
}

/**
 * Picks the index from which the tail should stay pinned — the most identifiable end of an
 * identifier, so the truncated middle never eats it:
 *
 * - Email: the domain, from the `@` (`me@example.com` → pins `@example.com`).
 * - Domain with a subdomain: the registrable domain, i.e. the label before the public suffix
 *   plus the suffix (`my.shop.domain.co.jp` → pins `.domain.co.jp`). `getTld` resolves
 *   multi-level suffixes like `co.jp` so they are kept whole.
 * - Bare registrable domain: just the public suffix, so the second-level label can be the part
 *   that truncates instead (`myverylongstore.com` → pins `.com`).
 *
 * Returns -1 when there is no natural boundary to pin (e.g. a value with no dot).
 */
function getTailStart( value: string ): number {
	const at = value.lastIndexOf( '@' );
	if ( at > 0 ) {
		return at;
	}

	const tld = getTld( value );
	if ( ! tld ) {
		return -1;
	}

	// Everything up to (but not including) the public suffix and its leading dot.
	const withoutTld = value.slice( 0, value.length - tld.length - 1 );
	const subdomainBoundary = withoutTld.lastIndexOf( '.' );

	return subdomainBoundary === -1 ? withoutTld.length : subdomainBoundary;
}

/**
 * Displays a string on a single line, middle-truncating it with an ellipsis when it runs
 * out of horizontal space. The beginning stays visible along with a pinned, identifiable
 * suffix — the registrable domain of a domain name (`my.shop.domain.co.jp` → `my.s….domain.co.jp`)
 * or the domain of an email (`myverylongemail@example.com` → `myverylonge…@example.com`) — so
 * the value stays recognizable. The full text is revealed on hover via the title tooltip.
 */
export default function MiddleTruncate( { text, children, className }: MiddleTruncateProps ) {
	const value = text ?? ( typeof children === 'string' ? children : '' );
	const tailStart = getTailStart( value );
	const head = tailStart > 0 ? value.slice( 0, tailStart ) : value;
	const tail = tailStart > 0 ? value.slice( tailStart ) : '';

	return (
		<HStack
			as="span"
			justify="flex-start"
			spacing={ 0 }
			expanded={ false }
			className={ clsx( 'dashboard-middle-truncate', className ) }
			title={ value }
		>
			<Text truncate>{ head }</Text>
			{ tail && <Text className="dashboard-middle-truncate__tail">{ tail }</Text> }
		</HStack>
	);
}
