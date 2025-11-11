import { Modal, __experimentalVStack as VStack, Button } from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import * as React from 'react';
import { ButtonStack } from '../../../components/button-stack';
import type { Purchase } from '@automattic/api-core';

interface MarketPlaceSubscriptionsDialogProps {
	planName: string;
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving?: boolean;
	activeSubscriptions: Purchase[];
	sectionHeadingText?: string;
	primaryButtonText?: string;
	bodyParagraphText?: string;
}

const MarketPlaceSubscriptionsWarning = ( {
	planName,
	closeDialog,
	removePlan,
	isDialogVisible,
	activeSubscriptions,
	sectionHeadingText,
	primaryButtonText,
	bodyParagraphText,
}: MarketPlaceSubscriptionsDialogProps ) => {
	return (
		isDialogVisible && (
			<Modal
				title={ String(
					sectionHeadingText ??
						sprintf(
							/* translators: %(plan)s is the name of the plan */
							__( 'Remove %(plan)s' ),
							{ plan: planName }
						)
				) }
				onRequestClose={ closeDialog }
			>
				<VStack>
					<p>
						{ _n(
							'The following subscription depends on your plan:',
							'The following subscriptions depend on your plan:',
							activeSubscriptions.length
						) }
					</p>
					<ul>
						{ activeSubscriptions.map( ( subscription ) => {
							return <li key={ subscription.ID }>{ subscription.product_name }</li>;
						} ) }
					</ul>
					<p>
						{ bodyParagraphText ??
							_n(
								'You should remove this subscription before downgrading your plan. Would you like to remove this subscription and downgrade your plan?',
								'You should remove these subscriptions before downgrading your plan. Would you like to remove all subscriptions and downgrade your plan?',
								activeSubscriptions.length
							) }
					</p>
					<ButtonStack justify="flex-end">
						<Button onClick={ closeDialog } disabled={ false /*updateDnsMutation.isPending*/ }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							isBusy={ /*updateDnsMutation.isPending*/ false }
							onClick={ removePlan }
							disabled={ false /*numberOfSelectedRecords === 0 || updateDnsMutation.isPending*/ }
						>
							{ primaryButtonText ?? __( 'Remove Plan & All Subscriptions' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</Modal>
		)
	);
};

export default MarketPlaceSubscriptionsWarning;
