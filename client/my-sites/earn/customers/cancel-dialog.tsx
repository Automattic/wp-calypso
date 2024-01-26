import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction } from 'react';
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
	const site = useSelector( getSelectedSite );

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
					'Removing this payment means that the user {{strong}}%(subscriber_email)s{{/strong}} will no longer have access to any service granted by the {{strong}}%(plan_name)s{{/strong}} plan.',
					{
						args: { subscriber_email, plan_name },
						components: {
							strong: <strong />,
						},
					}
				),
				confirmation_info_2: translate( 'The payment will not be refunded.' ),
				success: translate( 'Payment removed for %(subscriber_email)s.', {
					args: { subscriber_email },
				} ),
			};
		}

		return {
			button: translate( 'Cancel payment' ),
			confirmation_subheading: translate( 'Do you want to cancel this payment?' ),
			confirmation_info: translate(
				'Cancelling this payment means that the user {{strong}}%(subscriber_email)s{{/strong}} will no longer have access to any service granted by the {{strong}}%(plan_name)s{{/strong}} plan.',
				{
					args: { subscriber_email, plan_name },
					components: {
						strong: <strong />,
					},
				}
			),
			confirmation_info_2: translate(
				'Payments already made will not be refunded but any scheduled future payments will not be made.'
			),
			success: translate( 'Payment cancelled for %(subscriber_email)s.', {
				args: { subscriber_email },
			} ),
		};
	}

	return (
		<>
			{ subscriberToCancel && (
				<Dialog
					className="earn__cancel-dialog"
					isVisible={ Boolean( subscriberToCancel ) }
					buttons={ [
						{
							label: translate( 'Back' ),
							action: 'back',
						},
						{
							label: getText( subscriberToCancel ).button,
							isPrimary: true,
							additionalClassNames: 'is-scary',
							action: 'cancel',
						},
					] }
					onClose={ onCloseCancelSubscription }
				>
					<h1>{ getText( subscriberToCancel ).confirmation_subheading }</h1>
					<p>{ getText( subscriberToCancel ).confirmation_info }</p>
					<p>{ getText( subscriberToCancel ).confirmation_info_2 }</p>
				</Dialog>
			) }
		</>
	);
}

export default CancelDialog;
