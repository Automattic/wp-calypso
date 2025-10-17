import { Card, CardBody } from '@wordpress/components';
import { forwardRef } from 'react';

function UnforwardedDataViewsCard(
	{ className, children }: { className?: string; children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card ref={ ref } className={ className }>
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
