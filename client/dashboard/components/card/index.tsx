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
import { forwardRef } from 'react';

type CardProps = React.ComponentProps< typeof Card >;

const DashboardCard = forwardRef< HTMLElement, CardProps >(
	( { size, children, ...rest }, ref ) => {
		return (
			<Card ref={ ref } { ...rest } size={ size || 'small' }>
				{ children }
			</Card>
		);
	}
);

DashboardCard.displayName = 'DashboardCard';

export { DashboardCard as Card, CardBody, CardDivider, CardHeader, CardFooter, CardMedia };
