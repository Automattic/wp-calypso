import { __experimentalVStack as VStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
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
	description: ReactNode;
	children?: ReactNode;
} ) {
	const isMobile = useViewportMatch( 'small', '<' );
	return (
		<Card>
			<CardBody>
				<VStack
					spacing={ 8 }
					style={ { minHeight: ! isMobile ? 'min(70vh, 676px)' : 'auto' } }
					justify={ isMobile ? 'flex-start' : 'center' }
					alignment="center"
				>
					<VStack spacing={ 2 } alignment="center">
						<Text as="h2" size="20px" weight={ 500 } align="center">
							{ title }
						</Text>
						<Text style={ { width: 'min(100%, 432px)' } } variant="muted" align="center">
							{ description }
						</Text>
					</VStack>
					<VStack spacing={ 6 } style={ { width: 'min(100%, 660px)' } }>
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
