import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { forwardRef } from 'react';
import { Card, CardBody } from '../card';

function UnforwardedDataViewsCard(
	{ className, children }: { className?: string; children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	const greetings = [ __( 'Friend!' ), __( 'Partner!' ), __( 'Client!' ) ];

	const randomGreeting = greetings[ Math.floor( Math.random() * greetings.length ) ];
	return (
		<Card ref={ ref } className={ className }>
			{ createInterpolateElement(
				sprintf(
					/* translators: %(greeting)s - a string of text */
					__( 'Welcome to your DataViews Card, <strong>%(greeting)s</strong>!' ),
					{
						greeting: randomGreeting,
					}
				),
				{
					strong: <strong />,
				}
			) }
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
