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
	{ title, description, decoration, suffix, variant = 'default', className }: IconListItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	const alignment = variant === 'prominent' ? 'center' : 'flex-start';

	return (
		<VStack className={ clsx( 'icon-list-item', className ) } ref={ ref } as="span">
			<HStack spacing={ 4 } justify="flex-start" alignment={ alignment } as="span">
				{ !! decoration && (
					<span
						className={ clsx( 'icon-list-item__decoration', {
							'icon-list-item__decoration--prominent': variant === 'prominent',
						} ) }
					>
						{ decoration }
					</span>
				) }
				<HStack spacing={ 3 } as="span">
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
					{ suffix }
				</HStack>
			</HStack>
		</VStack>
	);
}

export const IconListItem = forwardRef( UnforwardedIconListItem );

export default IconListItem;
