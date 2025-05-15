import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
} from '@wordpress/components';
import { forwardRef } from 'react';
import ActionItem from './action-item';
import type { ActionListProps } from './types';
import './style.scss';

function UnforwardedActionList(
	{ title, description, children }: ActionListProps,
	ref: React.ForwardedRef< HTMLAnchorElement | HTMLButtonElement >
) {
	return (
		<Card className="action-list" ref={ ref }>
			{ ( title || description ) && (
				<VStack className="action-list__heading" spacing={ 2 }>
					{ title && <Text className="action-list__title">{ title }</Text> }
					{ description && (
						<Text className="action-list__description" variant="muted">
							{ description }
						</Text>
					) }
				</VStack>
			) }
			<VStack spacing={ 0 }>{ children }</VStack>
		</Card>
	);
}

export const ActionList = Object.assign( forwardRef( UnforwardedActionList ), {
	/**
	 * Renders a action item inside the `ActionList` component.
	 */
	ActionItem: Object.assign( ActionItem, {
		displayName: 'ActionList.ActionItem',
	} ),
} );

export default ActionList;
