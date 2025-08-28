import { Card, CardBody } from '@wordpress/components';
import { forwardRef } from 'react';

function UnforwardedDataViewsCard(
	{ children }: { children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card ref={ ref }>
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
