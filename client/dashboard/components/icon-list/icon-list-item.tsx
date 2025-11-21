import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef } from 'react';
import type { IconListItemProps } from './types';

import './icon-list-item.scss';

function UnforwardedIconListItem(
	{ title, description, decoration, suffix, className }: IconListItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	return (
		<VStack className={ clsx( 'icon-list-item', className ) } ref={ ref } as="span">
			<HStack spacing={ 3 } justify="flex-start" alignment="center" as="span">
				{ !! decoration && <span className="icon-list-item__decoration">{ decoration }</span> }
				<VStack spacing={ 1 } as="span">
					<Text weight={ 500 } lineHeight="20px">
						{ title }
					</Text>
					{ description && (
						<Text variant="muted" lineHeight="20px">
							{ description }
						</Text>
					) }
				</VStack>
				{ suffix && <span className="icon-list-item__suffix">{ suffix }</span> }
			</HStack>
		</VStack>
	);
}

export const IconListItem = forwardRef( UnforwardedIconListItem );

export default IconListItem;
