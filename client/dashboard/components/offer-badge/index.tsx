import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

import './style.scss';

/**
 * Green badge for offers shown above a price, such as "Special Offer" or
 * "3 month free trial". Matches the savings badge in the WordPress.com plans grid.
 */
export function OfferBadge( {
	className,
	isHidden = false,
	...props
}: Omit< ComponentProps< typeof Badge >, 'intent' > & {
	// Keeps the badge's space but hides it, so prices stay aligned across cards
	// when only some of them have an offer.
	isHidden?: boolean;
} ) {
	return (
		<Badge
			intent="stable"
			className={ clsx( 'offer-badge', className, { 'is-hidden': isHidden } ) }
			aria-hidden={ isHidden || undefined }
			{ ...props }
		/>
	);
}
