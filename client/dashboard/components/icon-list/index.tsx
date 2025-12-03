import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { Children, forwardRef } from 'react';
import { Card, CardBody } from '../card';
import IconListItem from './icon-list-item';
import type { IconListProps } from './types';

import './style.scss';

function UnforwardedIconList(
	{ title, description, children }: IconListProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	// Hide component if there are no children
	if ( ! children || Children.count( children ) === 0 ) {
		return null;
	}

	return (
		<Card className="icon-list" ref={ ref }>
			<CardBody>
				{ ( title || description ) && (
					<VStack className="icon-list__heading" spacing={ 2 }>
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
				<VStack className="icon-list__items" spacing={ 0 }>
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}

export const IconList = Object.assign( forwardRef( UnforwardedIconList ), {
	/**
	 * Renders an item inside the `IconList` component.
	 */
	Item: Object.assign( IconListItem, {
		displayName: 'IconList.Item',
	} ),
} );

export default IconList;
