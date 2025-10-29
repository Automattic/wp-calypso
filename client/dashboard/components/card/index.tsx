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
import { forwardRef } from 'react';

type CardProps = React.ComponentProps< typeof Card >;

const DashboardCard = forwardRef< HTMLElement, CardProps >(
	( { size, children, ...rest }, ref ) => {
		const isDesktop = useViewportMatch( 'medium' );

		let computedSize = size || 'medium';

		// Default to small on mobile, unless the size is explicitly set to xSmall.
		if ( ! isDesktop && size !== 'xSmall' ) {
			computedSize = 'small';
		}

		return (
			<Card ref={ ref } { ...rest } size={ computedSize }>
				{ children }
			</Card>
		);
	}
);

DashboardCard.displayName = 'DashboardCard';

export { DashboardCard as Card, CardBody, CardDivider, CardHeader, CardFooter, CardMedia };
