import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import cx from 'clsx';
import { forwardRef } from 'react';
import { ActionItem } from './action-item';
import styles from './style.module.scss';
import type { ActionListProps } from './types';

function UnforwardedActionList(
	{ title, description, children, className }: ActionListProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card className={ cx( styles[ 'action-list' ], className ) } ref={ ref }>
			<CardBody>
				{ ( title || description ) && (
					<VStack className={ styles[ 'action-list__heading' ] } spacing={ 2 }>
						{ title && (
							<Text size="15px" weight={ 500 } lineHeight="20px">
								{ title }
							</Text>
						) }
						{ description && (
							<Text variant="muted" lineHeight="20px">
								{ description }
							</Text>
						) }
					</VStack>
				) }
				<VStack className={ styles[ 'action-list__actions' ] } spacing={ 0 }>
					{ children }
				</VStack>
			</CardBody>
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

export * from './types';
