import { __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { ActionList } from '../action-list';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import type { ActionItemProps } from '../action-list/types';

import './style.scss';

function EmptyState( { children }: { children?: ReactNode } ) {
	return (
		<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state">
			{ children }
		</VStack>
	);
}

function EmptyStateWrapper( {
	isBorderless = false,
	children,
}: {
	isBorderless?: boolean;
	children: ReactNode;
} ) {
	const cardRef = useRef< HTMLElement >( null );

	// Calculate the vertical offset once on mount to set a consistent min-height.
	// This keeps the visual layout stable between view transitions. It's fine if
	// the wrapper expands beyond this initial calculation after layout changes.
	useLayoutEffect( () => {
		if ( ! cardRef.current ) {
			return;
		}
		const rect = cardRef.current.getBoundingClientRect();
		cardRef.current.style.setProperty( '--dashboard-empty-state-offset', `${ rect.top }px` );
	}, [] );

	return (
		<Card ref={ cardRef } className="dashboard-empty-state__wrapper" isBorderless={ isBorderless }>
			<CardBody>
				<VStack spacing={ 8 } alignment="center" className="dashboard-empty-state__wrapper-content">
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
	const isMobile = useViewportMatch( 'mobile', '<' );

	if ( isMobile ) {
		return <ActionList.ActionItem { ...props } layout="stacked" />;
	}

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
