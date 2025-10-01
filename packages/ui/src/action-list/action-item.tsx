import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Disabled,
} from '@wordpress/components';
import cx from 'clsx';
import { forwardRef } from 'react';
import styles from './style.module.scss';
import type { ActionItemProps } from './types';

function UnforwardedActionItem(
	{ title, description, decoration, actions, className, status }: ActionItemProps,
	ref: React.ForwardedRef< HTMLSpanElement >
) {
	return (
		<Disabled isDisabled={ status === 'disabled' }>
			<VStack
				className={ cx(
					styles[ 'action-item' ],
					{
						[ styles[ 'action-item--muted' ] ]: status === 'disabled' || status === 'complete',
					},
					className
				) }
				ref={ ref }
				as="span"
			>
				<HStack spacing={ 3 } justify="flex-start" alignment="center" as="span">
					{ !! decoration && (
						<span className={ styles[ 'action-item__decoration' ] }>{ decoration }</span>
					) }
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
							className={ styles[ 'action-item__actions' ] }
							justify="flex-end"
							expanded={ false }
							as="span"
							spacing={ 3 }
						>
							{ actions }
						</HStack>
					</HStack>
				</HStack>
			</VStack>
		</Disabled>
	);
}

export const ActionItem = forwardRef( UnforwardedActionItem );
