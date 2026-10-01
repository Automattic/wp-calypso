import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import type { ReactNode } from 'react';

/** A step of a host page's purchase, numbered so the eye has an order to follow. */
export default function StepHeading( { step, children }: { step: number; children: ReactNode } ) {
	return (
		<HStack spacing={ 3 } justify="flex-start" expanded={ false }>
			<span className="dashboard-marketplace-hosting__step-number" aria-hidden="true">
				{ step }
			</span>
			<Heading level={ 3 } size={ 15 } weight={ 500 }>
				{ children }
			</Heading>
		</HStack>
	);
}
