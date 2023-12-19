import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction } from 'react';
import Notice from 'calypso/components/notice';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSubscriptionStop } from 'calypso/state/memberships/subscribers/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { Subscriber } from '../types';

type CancelDialogProps = {
	subscriberToCancel: Subscriber | null;
	setSubscriberToCancel: Dispatch< SetStateAction< Subscriber | null > >;
};

function CancelDialog( { subscriberToCancel, setSubscriberToCancel }: CancelDialogProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	function onCloseCancelSubscription( reason: string | undefined ) {
		if ( reason === 'cancel' ) {
			dispatch(
				requestSubscriptionStop(
					site?.ID,
					subscriberToCancel,
					getText( subscriberToCancel ).success
				)
			);
		}
		setSubscriberToCancel( null );
	}

	function getText( subscriber: Subscriber | null ) {
		const subscriber_email = subscriber?.user.user_email ?? '';
		const plan_name = subscriber?.plan.title ?? '';

		if ( subscriber?.plan?.renew_interval === 'one-time' ) {
			return {
				button: translate( 'Remove payment' ),
				confirmation_subheading: translate( 'Do you want to remove this payment?' ),
				confirmation_info: translate(
					'Removing this payment means that the user %(subscriber_email)s will no longer have access to any service granted by the %(plan_name)s plan. The payment will not be refunded.',
					{ args: { subscriber_email, plan_name } }
				),
				success: translate( 'Payment removed for %(subscriber_email)s.', {
					args: { subscriber_email },
				} ),
			};
		}
		return {
			button: translate( 'Cancel payment' ),
			confirmation_subheading: translate( 'Do you want to cancel this payment?' ),
			confirmation_info: translate(
				'Cancelling this payment means that the user %(subscriber_email)s will no longer have access to any service granted by the %(plan_name)s plan. Payments already made will not be refunded but any scheduled future payments will not be made.',
				{ args: { subscriber_email, plan_name } }
			),
			success: translate( 'Payment cancelled for %(subscriber_email)s.', {
				args: { subscriber_email },
			} ),
		};
	}

	return (
		<Dialog
			isVisible={ Boolean( subscriberToCancel ) }
			buttons={ [
				{
					label: translate( 'Back' ),
					action: 'back',
				},
				{
					label: getText( subscriberToCancel ).button,
					isPrimary: true,
					action: 'cancel',
				},
			] }
			onClose={ onCloseCancelSubscription }
		>
			<h1>{ translate( 'Confirmation' ) }</h1>
			<p>{ getText( subscriberToCancel ).confirmation_subheading }</p>
			<Notice text={ getText( subscriberToCancel ).confirmation_info } showDismiss={ false } />
		</Dialog>
	);
}

export default CancelDialog;
