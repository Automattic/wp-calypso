import { __experimentalVStack as VStack } from '@wordpress/components';
import { ActionList } from '../action-list';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import type { ActionItemProps } from '../action-list/types';
import type { ReactNode } from 'react';

import './style.scss';

function EmptyState( { children }: { children?: ReactNode } ) {
	return (
		<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state">
			{ children }
		</VStack>
	);
}

function EmptyStateWrapper( { children }: { children: ReactNode } ) {
	return (
		<Card className="dashboard-empty-state__wrapper">
			<CardBody>
				<VStack spacing={ 8 } alignment="center">
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

function EmptyStateHeader( { children }: { children: ReactNode } ) {
	return (
		<VStack spacing={ 2 } alignment="center">
			{ children }
		</VStack>
	);
}

function EmptyStateContent( { children }: { children: ReactNode } ) {
	return (
		<VStack spacing={ 6 } className="dashboard-empty-state__content">
			{ children }
		</VStack>
	);
}

function EmptyStateActionList( { children }: { children?: ReactNode } ) {
	return <ActionList>{ children }</ActionList>;
}

function EmptyStateActionItem( props: ActionItemProps ) {
	return <ActionList.ActionItem { ...props } />;
}

const EmptyStateWithStatics = Object.assign( EmptyState, {
	Wrapper: EmptyStateWrapper,
	Title: EmptyStateTitle,
	Description: EmptyStateDescription,
	Header: EmptyStateHeader,
	Content: EmptyStateContent,
	ActionList: EmptyStateActionList,
	ActionItem: EmptyStateActionItem,
} );

export default EmptyStateWithStatics;
