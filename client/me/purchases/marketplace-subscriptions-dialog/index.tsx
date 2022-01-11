import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, ReactChild, useState } from 'react';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';

interface ButtonProps {
	action: string;
	label: ReactChild;
	onClick: () => void;
	isPrimary?: boolean;
	busy?: boolean;
}

interface MarketPlaceSubscriptionsDialogProps {
	planName: string;
	closeDialog: () => void;
	removePlan: () => void;
	isDialogVisible: boolean;
	isRemoving: boolean;
	activeSubscriptions: Array< { id: number; productName: string } >;
	removeAllSubscriptions: () => void;
}

export const MarketPlaceSubscriptionsDialog = ( {
	planName,
	closeDialog,
	removePlan,
	isDialogVisible,
	isRemoving,
	activeSubscriptions,
	removeAllSubscriptions,
}: MarketPlaceSubscriptionsDialogProps ): JSX.Element => {
	const translate = useTranslate();

	const [ removeAction, setRemoveAction ] = useState( '' );

	const buttons: ButtonProps[] = [
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
			action: 'removeAllSubscriptions',
			label: translate( 'Remove All Subscriptions' ),
			onClick: removeAllSubscriptions,
			busy: true,
		},
	];

	const renderButton = ( { action, label, onClick, isPrimary }: ButtonProps ) => (
		<Button
			disabled={ isRemoving && removeAction !== action }
			busy={ isRemoving && removeAction === action }
			onClick={ () => {
				onClick();
				setRemoveAction( action );
			} }
			primary={ isPrimary }
			data-e2e-button={ action }
			data-tip-target={ `dialog-base-action-${ action }` }
		>
			{ label }
		</Button>
	);

	return (
		<Dialog
			buttons={ buttons.map( ( b ) => renderButton( b ) ) }
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
