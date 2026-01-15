import clsx from 'clsx';
import { forwardRef } from 'react';
import { ButtonStack } from '../button-stack';
import { IconListItem } from '../icon-list/icon-list-item';
import type { ActionItemProps } from './types';

import './action-item.scss';

function UnforwardedActionItem(
	{ title, description, decoration, actions, className, stackActions = false }: ActionItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	return (
		<IconListItem
			className={ clsx( 'action-item', className ) }
			title={ title }
			description={ description }
			decoration={ decoration }
			suffix={
				<ButtonStack
					className="action-item__actions"
					justify={ stackActions ? 'flex-start' : 'flex-end' }
					expanded={ stackActions }
					as="span"
				>
					{ actions }
				</ButtonStack>
			}
			ref={ ref }
			stackSuffix={ stackActions }
		/>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );

export default ActionItem;
