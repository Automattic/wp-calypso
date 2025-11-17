import { forwardRef } from 'react';
import { ButtonStack } from '../button-stack';
import { IconListItem } from '../icon-list/icon-list-item';
import type { ActionItemProps } from './types';

import './action-item.scss';

function UnforwardedActionItem(
	{ title, description, decoration, actions }: ActionItemProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<IconListItem
			className="action-item"
			title={ title }
			description={ description }
			decoration={ decoration }
			suffix={
				<ButtonStack
					className="action-item__actions"
					justify="flex-end"
					expanded={ false }
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
