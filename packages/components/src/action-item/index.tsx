import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { forwardRef } from 'react';
import { ActionItemProps } from './types';
import './style.scss';

function UnforwardedActionItem(
	{ title, description, decoration, actionLabel, isDestructive, onClick }: ActionItemProps,
	ref: React.ForwardedRef< HTMLAnchorElement | HTMLButtonElement >
) {
	return (
		<VStack className="action-item" ref={ ref } as="span">
			<HStack spacing={ 3 } justify="flex-start" alignment="center" as="span">
				{ !! decoration && <span className="action-item-decoration">{ decoration }</span> }
				<HStack as="span">
					<VStack spacing={ 1 } as="span">
						<Text className="action-item-title">{ title } </Text>
						{ description && (
							<Text className="action-item-description" variant="muted">
								{ description }
							</Text>
						) }
					</VStack>
					<Button
						className="action-item-button"
						variant="secondary"
						size="compact"
						isDestructive={ isDestructive }
						onClick={ onClick }
					>
						{ actionLabel }
					</Button>
				</HStack>
			</HStack>
		</VStack>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );

export default ActionItem;
