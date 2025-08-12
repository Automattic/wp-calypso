import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { forwardRef } from 'react';
import type { ActionItemProps } from './types';
import './action-item.scss';

function UnforwardedActionItem(
	{ title, description, decoration, actions }: ActionItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	return (
		<VStack className="action-item" ref={ ref } as="span">
			<HStack spacing={ 3 } justify="flex-start" alignment="center" as="span">
				{ !! decoration && <span className="action-item__decoration">{ decoration }</span> }
				<HStack as="span">
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
					<HStack
						className="action-item__actions"
						spacing={ 2 }
						justify="flex-end"
						expanded={ false }
						as="span"
					>
						{ actions }
					</HStack>
				</HStack>
			</HStack>
		</VStack>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );

export default ActionItem;
