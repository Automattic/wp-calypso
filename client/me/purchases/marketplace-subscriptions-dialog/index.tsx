import { Dialog } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { Fragment } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

interface MarketPlaceSubscriptionsDialogProps {
	planName: string;
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	activeSubscriptions: Array< { id: number; productName: string } >;
	sectionHeadingText?: TranslateResult;
	primaryButtonText?: TranslateResult;
	bodyParagraphText?: TranslateResult;
}

export const MarketPlaceSubscriptionsDialog = ( {
	planName,
	closeDialog,
	removePlan,
	isDialogVisible,
	activeSubscriptions,
	sectionHeadingText,
	primaryButtonText,
	bodyParagraphText,
}: MarketPlaceSubscriptionsDialogProps ) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: closeDialog,
		},
		{
			isPrimary: true,
			action: 'removePlanAndAllSubscriptions',
			label:
				primaryButtonText ??
				translate( 'Remove Plan & All Subscriptions', {
					comment:
						'This button removes the active plan and all active Marketplace subscriptions on the site',
				} ),
			onClick: removePlan,
		},
	];

	return (
		<Dialog
			buttons={ buttons }
			className="marketplace-subscriptions-dialog"
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<Fragment>
				<FormSectionHeading>
					{ sectionHeadingText ??
						translate( 'Remove %(plan)s', {
							args: { plan: planName },
						} ) }
				</FormSectionHeading>
				<p>
					{ translate(
						'The following subscription depends on your plan:',
						'The following subscriptions depend on your plan:',
						{ count: activeSubscriptions.length }
					) }
				</p>
				<ul>
					{ activeSubscriptions.map( ( subscription ) => {
						return <li key={ subscription.id }>{ subscription.productName }</li>;
					} ) }
				</ul>
				<p>
					{ bodyParagraphText ??
						translate(
							'You should remove this subscription before downgrading your plan. Would you like to remove this subscription and downgrade your plan?',
							'You should remove these subscriptions before downgrading your plan. Would you like to remove all subscriptions and downgrade your plan?',
							{ count: activeSubscriptions.length }
						) }
				</p>
			</Fragment>
		</Dialog>
	);
};
