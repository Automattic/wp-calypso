import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import EmptyStateActionItem from './empty-state-action-item';
import EmptyStateActionList from './empty-state-action-list';
import type { ReactNode } from 'react';

function EmptyState( {
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack style={ { minHeight: '676px' } } spacing={ 8 } alignment="center">
					<VStack spacing={ 2 }>
						<Text as="h2" size="20px" weight={ 500 } align="center">
							{ title }
						</Text>
						<Text style={ { maxWidth: '351px' } } variant="muted" align="center">
							{ description }
						</Text>
					</VStack>
					<VStack spacing={ 6 } style={ { maxWidth: '660px' } }>
						{ children }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

const EmptyStateWithStatics = Object.assign( EmptyState, {
	ActionList: EmptyStateActionList,
	ActionItem: EmptyStateActionItem,
} );

export default EmptyStateWithStatics;
