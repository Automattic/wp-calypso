import SummaryButton from '@automattic/components/src/summary-button';
import { createLink } from '@tanstack/react-router';
import { useViewportMatch } from '@wordpress/compose';
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import type { SummaryButtonProps } from '@automattic/components/src/summary-button/types';

import './style.scss';

/**
 * This component is a wrapper of `SummaryButton` component and acts as a
 * navigational element. It uses `createLink` from `@tanstack/react-router` to create a
 * link that can be used to navigate to a different route when the button is clicked.
 * It's separate from `SummaryButton` to allow for better separation of concerns, as
 * `SummaryButton` is a pure UI component.
 */
export const RouterLinkSummaryButton = forwardRef<
	HTMLAnchorElement | HTMLButtonElement,
	SummaryButtonProps
>( function RouterLinkSummaryButton( props, ref ) {
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	return (
		<SummaryButton
			{ ...props }
			ref={ ref }
			className={ clsx( 'router-link-summary-button', {
				'is-small-viewport': isSmallViewport,
			} ) }
		/>
	);
} );

export default createLink( RouterLinkSummaryButton );
