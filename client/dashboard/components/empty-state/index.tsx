import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import './styles.scss';
import { Text } from '../text';
import type { ReactNode } from 'react';

interface EmptyStateProps {
	buttons?: ReactNode;
	heading: string;
	illustration?: ReactNode;
	subHeading: string;
}

export function EmptyState( { buttons, heading, illustration, subHeading }: EmptyStateProps ) {
	return (
		<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state">
			<VStack spacing={ 3 } alignment="center">
				{ illustration }
				<VStack spacing={ 2 } alignment="center">
					<div className="dashboard-empty-state__heading">{ heading }</div>
					<Text variant="muted" align="center">
						{ subHeading }
					</Text>
				</VStack>
			</VStack>
			{ buttons && (
				<HStack spacing={ 4 } justify="center">
					{ buttons }
				</HStack>
			) }
		</VStack>
	);
}
