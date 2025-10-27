import { Card, CardBody, CardDivider, CardHeader, CardFooter } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { forwardRef, PropsWithChildren, HTMLAttributes } from 'react';

type CardProps = PropsWithChildren<
	{
		size?: 'xSmall' | 'small' | 'medium' | 'large';
	} & HTMLAttributes< HTMLDivElement >
>;

const DashboardCard = forwardRef< HTMLDivElement, CardProps >(
	( { size, children, ...rest }, ref ) => {
		const isDesktop = useViewportMatch( 'medium' );
		const computedSize = isDesktop ? size || 'medium' : 'small';

		return (
			<Card ref={ ref } { ...rest } size={ computedSize }>
				{ children }
			</Card>
		);
	}
);

DashboardCard.displayName = 'DashboardCard';

export { DashboardCard as Card, CardBody, CardDivider, CardHeader, CardFooter };
