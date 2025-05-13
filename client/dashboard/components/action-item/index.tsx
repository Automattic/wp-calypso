import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useState, forwardRef } from 'react';
import { ActionItemModal } from './action-item-modal';
import type { ActionItemProps } from './types';
import './style.scss';

function UnforwardedActionItem(
	{ title, description, decoration, action }: ActionItemProps,
	ref: React.ForwardedRef< HTMLAnchorElement | HTMLButtonElement >
) {
	const [ isActionItemModalOpen, setIsActionItemModalOpen ] = useState( false );

	return (
		<>
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
							label={ action.label }
							isBusy={ action.isBusy }
							disabled={ !! action.disabled }
							accessibleWhenDisabled
							isDestructive={ action.isDestructive }
							onClick={ () => {
								if ( 'RenderModal' in action ) {
									setIsActionItemModalOpen( true );
									return;
								}
								action.callback();
							} }
						>
							{ action.label }
						</Button>
					</HStack>
				</HStack>
			</VStack>
			{ 'RenderModal' in action && !! isActionItemModalOpen && (
				<ActionItemModal action={ action } closeModal={ () => setIsActionItemModalOpen( false ) } />
			) }
		</>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );

export default ActionItem;
