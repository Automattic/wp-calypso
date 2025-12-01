import { forwardRef } from 'react';
import { Card, CardBody } from '../card';

function UnforwardedDataViewsCard(
	{
		className,
		children,
		fillHeight,
	}: { className?: string; children: React.ReactNode; fillHeight?: boolean },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	const bodyStyle = fillHeight ? { height: '100%' } : undefined;

	return (
		<Card ref={ ref } className={ className }>
			<CardBody style={ bodyStyle }>{ children }</CardBody>
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
