import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import EmptyStateActionItem from './empty-state-action-item';
import EmptyStateActionList from './empty-state-action-list';
import type { ReactNode } from 'react';

import './style.scss';

function EmptyState( { children }: { children?: ReactNode } ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state">
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}

function EmptyStateTitle( { children }: { children: ReactNode } ) {
	return (
		<Text as="h2" align="center" className="dashboard-empty-state__title">
			{ children }
		</Text>
	);
}

function EmptyStateDescription( { children }: { children: ReactNode } ) {
	return (
		<Text variant="muted" align="center" className="dashboard-empty-state__description">
			{ children }
		</Text>
	);
}

function EmptyStateContent( { children }: { children: ReactNode } ) {
	return <div className="dashboard-empty-state__content">{ children }</div>;
}

const EmptyStateWithStatics = Object.assign( EmptyState, {
	Title: EmptyStateTitle,
	Description: EmptyStateDescription,
	Content: EmptyStateContent,
	ActionList: EmptyStateActionList,
	ActionItem: EmptyStateActionItem,
} );

export default EmptyStateWithStatics;
