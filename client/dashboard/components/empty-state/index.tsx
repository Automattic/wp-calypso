import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import './styles.scss';
import { Text } from '../text';
import type { ReactNode } from 'react';

interface EmptyStateProps {
	actions?: ReactNode;
	description: string;
	illustration?: ReactNode;
	title: string;
}

export function EmptyState( { actions, title, illustration, description }: EmptyStateProps ) {
	return (
		<VStack spacing={ 6 } alignment="center" className="dashboard-empty-state">
			{ illustration }
			<VStack spacing={ 2 } alignment="center">
				<div className="dashboard-empty-state__heading">{ title }</div>
				<Text variant="muted" align="center" className="dashboard-empty-state__sub-heading">
					{ description }
				</Text>
			</VStack>
			{ actions && (
				<HStack spacing={ 4 } justify="center" wrap>
					{ actions }
				</HStack>
			) }
		</VStack>
	);
}
