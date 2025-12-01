import clsx from 'clsx';
import { forwardRef } from 'react';
import { Card, CardBody } from '../card';

function UnforwardedDataViewsCard(
	{ className, children }: { className?: string; children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card ref={ ref } className={ clsx( className, 'dataviews-card' ) }>
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
