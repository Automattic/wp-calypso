import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

export const MarketPlaceSubscriptionsDialog = ( {
	planName,
	closeDialog,
	removePlan,
	isDialogVisible,
	activeSubscriptions,
	removeAllSubscriptions,
} ) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: closeDialog,
		},
		{
			action: 'removePlan',
			label: translate( 'Remove Plan' ),
			onClick: removePlan,
		},
		{
			isPrimary: true,
			action: 'removePlan',
			label: translate( 'Remove All Subscriptions' ),
			onClick: removeAllSubscriptions,
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
					{ translate( 'Remove %(plan)s', {
						args: { plan: planName },
					} ) }
				</FormSectionHeading>
				<p>
					{ translate(
						'When you downgrade your plan, the following active subscription will remain active:',
						'When you downgrade your plan, the following active subscriptions will remain active:',
						{ count: activeSubscriptions.length }
					) }
				</p>
				<ul>
					{ activeSubscriptions.map( ( subscription ) => {
						return <li key={ subscription.id }>{ subscription.productName }</li>;
					} ) }
				</ul>
				<p>
					{ translate(
						'You should remove this subscription before downgrading your plan. Would you still like to downgrade your plan?',
						'You should remove these subscriptions before downgrading your plan. Would you still like to downgrade your plan?',
						{ count: activeSubscriptions.length }
					) }
				</p>
			</Fragment>
		</Dialog>
	);
};
