import clsx from 'clsx';
import { forwardRef } from 'react';
import { ButtonStack } from '../button-stack';
import { IconListItem } from '../icon-list/icon-list-item';
import type { ActionItemProps } from './types';

import './action-item.scss';

const BUTTON_STACK_CONFIG = {
	inline: { justify: 'flex-end' as const, expanded: false },
	stacked: { justify: 'flex-start' as const, expanded: true },
};

function UnforwardedActionItem(
	{ title, description, decoration, actions, className, layout = 'inline' }: ActionItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	const buttonConfig = BUTTON_STACK_CONFIG[ layout ];
	return (
		<IconListItem
			className={ clsx( 'action-item', className ) }
			title={ title }
			description={ description }
			decoration={ decoration }
			layout={ layout }
			suffix={
				<ButtonStack
					className="action-item__actions"
					justify={ buttonConfig.justify }
					expanded={ buttonConfig.expanded }
					as="span"
				>
					{ actions }
				</ButtonStack>
			}
			ref={ ref }
		/>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );

export default ActionItem;
