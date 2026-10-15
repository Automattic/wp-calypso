import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import type { ReactNode } from 'react';

export default function StepHeading( { step, children }: { step: number; children: ReactNode } ) {
	return (
		<HStack spacing={ 3 } justify="flex-start" expanded={ false }>
			<HStack
				justify="center"
				expanded={ false }
				className="dashboard-marketplace-hosting__step-number"
				aria-hidden="true"
			>
				<Text size={ 12 } weight={ 500 } color="inherit">
					{ step }
				</Text>
			</HStack>
			<Heading level={ 3 } size={ 15 } weight={ 500 }>
				{ children }
			</Heading>
		</HStack>
	);
}
