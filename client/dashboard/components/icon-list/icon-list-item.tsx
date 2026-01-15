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
	{ title, description, decoration, suffix, className, density = 'medium' }: IconListItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	const densitySpacingMap = {
		low: 3,
		medium: 2,
		high: 1,
	};

	const iconSpacing = densitySpacingMap[ density ];
	const textSpacing = densitySpacingMap[ density ] / 2;
	const suffixSpacing = densitySpacingMap[ density ];
	const titleSize = density === 'low' ? '15px' : undefined;
	const alignment = description ? 'flex-start' : 'center';

	return (
		<VStack className={ clsx( 'icon-list-item', className ) } ref={ ref } as="span">
			<HStack spacing={ iconSpacing } alignment={ alignment } as="span">
				{ !! decoration && <span className="icon-list-item__decoration">{ decoration }</span> }
				<HStack spacing={ suffixSpacing } as="span">
					<VStack spacing={ textSpacing } as="span">
						<Text weight={ 500 } lineHeight="24px" size={ titleSize }>
							{ title }
						</Text>
						{ description && <Text variant="muted">{ description }</Text> }
					</VStack>
					{ suffix }
				</HStack>
			</HStack>
		</VStack>
	);
}

export const IconListItem = forwardRef( UnforwardedIconListItem );

export default IconListItem;
