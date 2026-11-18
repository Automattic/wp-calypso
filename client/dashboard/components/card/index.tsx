/* eslint-disable no-restricted-imports */
import {
	Card,
	CardBody,
	CardDivider,
	CardHeader,
	CardFooter,
	CardMedia,
} from '@wordpress/components';
/* eslint-enable no-restricted-imports */
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { forwardRef } from 'react';

type CardProps = React.ComponentProps< typeof Card >;

const DashboardCard = forwardRef< HTMLElement, CardProps >(
	( { className, isBorderless, size, children, ...rest }, ref ) => {
		const isDesktop = useViewportMatch( 'medium' );

		let computedSize = size || 'medium';

		// Default to small on mobile, unless the size is explicitly set to xSmall.
		if ( ! isDesktop && size !== 'xSmall' ) {
			computedSize = 'small';
		}

		return (
			<Card
				ref={ ref }
				{ ...rest }
				// The component's own borderless style is a single-class rule, so the dark
				// theme's card border outranks it. This marker class gives the dark theme a
				// selector to turn the border back off with (`dashboard-dark-theme-card`).
				className={ clsx( className, { 'dashboard-card-borderless': isBorderless } ) }
				isBorderless={ isBorderless }
				size={ computedSize }
			>
				{ children }
			</Card>
		);
	}
);

DashboardCard.displayName = 'DashboardCard';

export { DashboardCard as Card, CardBody, CardDivider, CardHeader, CardFooter, CardMedia };
