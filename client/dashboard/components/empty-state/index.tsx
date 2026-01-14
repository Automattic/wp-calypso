import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import EmptyStateActionItem from './empty-state-action-item';
import EmptyStateActionList from './empty-state-action-list';
import type { ReactNode } from 'react';

import './style.scss';

function EmptyState( {
	title,
	description,
	children,
}: {
	title: string;
	description: ReactNode;
	children?: ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state">
					<VStack spacing={ 2 } alignment="center">
						<Text as="h2" align="center" className="dashboard-empty-state__title">
							{ title }
						</Text>
						<Text variant="muted" align="center" className="dashboard-empty-state__description">
							{ description }
						</Text>
					</VStack>
					<VStack spacing={ 6 } className="dashboard-empty-state__content">
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
