import { __experimentalVStack as VStack } from '@wordpress/components';
import { Children, forwardRef } from 'react';
import IconListItem from './icon-list-item';
import type { IconListProps } from './types';

import './style.scss';

function UnforwardedIconList(
	{ children }: IconListProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	// Hide component if there are no children
	if ( ! children || Children.count( children ) === 0 ) {
		return null;
	}

	return (
		<VStack className="icon-list" spacing={ 0 } justify="flex-start" ref={ ref }>
			{ children }
		</VStack>
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
