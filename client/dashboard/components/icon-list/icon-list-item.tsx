import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef } from 'react';
import type { IconListItemProps, ItemLayout } from './types';

import './icon-list-item.scss';

const LAYOUT_CONFIG: Record<
	ItemLayout,
	{
		Component: typeof HStack | typeof VStack;
		outerAlignment: string; // For Icon alignment within content
		innerAlignment: string | undefined;
		className?: string;
	}
> = {
	inline: {
		Component: HStack,
		outerAlignment: 'center',
		innerAlignment: undefined,
		className: undefined,
	},
	stacked: {
		Component: VStack,
		outerAlignment: 'flex-start',
		innerAlignment: 'flex-start',
		className: 'icon-list-item__content--wrap',
	},
};

function UnforwardedIconListItem(
	{
		title,
		description,
		decoration,
		suffix,
		className,
		density = 'medium',
		layout = 'inline',
	}: IconListItemProps,
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

	const layoutConfig = LAYOUT_CONFIG[ layout ];
	const { Component: LayoutComponent } = layoutConfig;

	// Description forces top alignment regardless of layout
	const outerAlignment = description ? 'flex-start' : layoutConfig.outerAlignment;

	return (
		<VStack className={ clsx( 'icon-list-item', className ) } ref={ ref } as="span">
			<HStack spacing={ iconSpacing } alignment={ outerAlignment } as="span">
				{ !! decoration && <span className="icon-list-item__decoration">{ decoration }</span> }
				<LayoutComponent
					className={ layoutConfig.className }
					alignment={ layoutConfig.innerAlignment }
					spacing={ suffixSpacing }
					as="span"
				>
					<VStack spacing={ textSpacing } as="span">
						<Text weight={ 500 } lineHeight="24px" size={ titleSize }>
							{ title }
						</Text>
						{ description && <Text variant="muted">{ description }</Text> }
					</VStack>
					{ suffix }
				</LayoutComponent>
			</HStack>
		</VStack>
	);
}

export const IconListItem = forwardRef( UnforwardedIconListItem );

export default IconListItem;
