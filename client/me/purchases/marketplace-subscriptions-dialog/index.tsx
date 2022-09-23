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
}

interface MarketPlaceRemoveSubscriptionsDialogProps extends MarketPlaceSubscriptionsDialogProps {
	buttons: {
		label: TranslateResult;
		onClick: () => void;
		isPrimary?: boolean;
		action: string;
	}[];
	bodyMessage: TranslateResult;
}

const MarketPlaceSubscriptionsDialog = ( {
	planName,
	closeDialog,
	isDialogVisible,
	activeSubscriptions,
	buttons,
	bodyMessage,
}: MarketPlaceRemoveSubscriptionsDialogProps ) => {
	const translate = useTranslate();

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
				<p>{ bodyMessage }</p>
			</Fragment>
		</Dialog>
	);
};

export const MarketPlaceRemoveSubscriptionsDialog = (
	props: MarketPlaceSubscriptionsDialogProps
) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: props.closeDialog,
		},
		{
			isPrimary: true,
			action: 'removePlanAndAllSubscriptions',
			label: translate( 'Remove Plan & All Subscriptions', {
				comment:
					'This button removes the active plan and all active Marketplace subscriptions on the site',
			} ),
			onClick: props.removePlan,
		},
	];

	const bodyMessage = translate(
		'You should remove this subscription before downgrading your plan. Would you like to remove this subscription and downgrade your plan?',
		'You should remove these subscriptions before downgrading your plan. Would you like to remove all subscriptions and downgrade your plan?',
		{
			count: props.activeSubscriptions.length,
		}
	);
	return (
		<MarketPlaceSubscriptionsDialog { ...props } buttons={ buttons } bodyMessage={ bodyMessage } />
	);
};

export const MarketPlaceCancelSubscriptionsDialog = (
	props: MarketPlaceSubscriptionsDialogProps
) => {
	const translate = useTranslate();

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
			onClick: props.closeDialog,
		},
		{
			isPrimary: true,
			action: 'cancelPlanAndExpireAllSubscriptions',
			label: translate( 'Cancel Plan', {
				comment:
					'This button cancels the active plan and will remove active Marketplace subscriptions on the site after they expire',
			} ),
			onClick: props.removePlan,
		},
	];

	const bodyMessage = translate(
		'The subscription and the software will be removed after your plan expires',
		'The subscriptions and the software will be removed after your plan expires',
		{
			count: props.activeSubscriptions.length,
		}
	);
	return (
		<MarketPlaceSubscriptionsDialog { ...props } buttons={ buttons } bodyMessage={ bodyMessage } />
	);
};
