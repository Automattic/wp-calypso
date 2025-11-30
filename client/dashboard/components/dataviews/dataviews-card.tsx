import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { forwardRef } from 'react';
import { Card, CardBody } from '../card';

function UnforwardedDataViewsCard(
	{ className, children }: { className?: string; children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card ref={ ref } className={ className }>
			<CardBody>{ children }</CardBody>

			{ createInterpolateElement(
				sprintf(
					/* translators: %(newOwnerEmail)s - the test email */
					__( 'Invitation sent to <strong>%(testEmail)s</strong>' ),
					{
						testEmail: 'test@example.com',
					}
				),
				{
					strong: <strong />,
				}
			) }
		</Card>
	);
}

export const DataViewsCard = forwardRef( UnforwardedDataViewsCard );
