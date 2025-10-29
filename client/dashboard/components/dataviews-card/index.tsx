import { forwardRef } from 'react';
import { Card, CardBody } from '../../components/card';

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
