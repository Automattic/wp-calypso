import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import ConfirmModal from 'calypso/components/confirm-modal';
import { useRecordRemoveModal } from '../../tracks';
import { Subscriber } from '../../types';

export enum UnsubscribeActionType {
	Manage = 'manage',
	Unsubscribe = 'unsubscribe',
}

type UnsubscribeModalProps = {
	subscribers?: Subscriber[];
	onCancel: () => void;
	onConfirm: ( action: UnsubscribeActionType, subscriber?: Subscriber ) => void;
};

const UnsubscribeModal = ( { subscribers, onCancel, onConfirm }: UnsubscribeModalProps ) => {
	const translate = useTranslate();
	const subscriber = subscribers?.[ 0 ];
	const someSubscriberHasPlans = !! subscribers?.some( ( subscriber ) => subscriber.plans?.length );
	const isSingleSubscriber = subscribers?.length === 1;
	const recordRemoveModal = useRecordRemoveModal();

	const freeSubscriberProps = isSingleSubscriber
		? {
				action: UnsubscribeActionType.Unsubscribe,
				confirmButtonLabel: translate( 'Remove subscriber' ),
				text: translate(
					'Are you sure you want to remove %s from your list? They will no longer receive new notifications from your site.',
					{
						args: [ subscriber?.display_name as string ],
						comment: "%s is the subscriber's public display name",
					}
				),
				title: translate( 'Remove free subscriber' ),
		  }
		: {
				action: UnsubscribeActionType.Unsubscribe,
				confirmButtonLabel: translate( 'Remove subscribers' ),
				text: translate(
					'Are you sure you want to remove %d subscibers from your list? They will no longer receive new notifications from your site.',
					{
						args: [ subscribers?.length as number ],
						comment: '%d is the number of subscribers',
					}
				),
				title: translate( 'Remove free subscribers' ),
		  };

	const paidSubscriberProps = isSingleSubscriber
		? {
				action: UnsubscribeActionType.Manage,
				confirmButtonLabel: translate( 'Manage paid subscribers' ),
				text: translate(
					'To remove %s from your list, you’ll need to cancel their paid subscription first.',
					{
						args: [ subscriber?.display_name as string ],
						comment: "%s is the subscriber's public display name",
					}
				),
				title: translate( 'Remove paid subscriber' ),
		  }
		: {
				action: UnsubscribeActionType.Manage,
				confirmButtonLabel: translate( 'Manage paid subscribers' ),
				text: translate(
					'Some subscribers have paid subscriptions. To remove them from your list, you’ll need to cancel their paid subscription first.'
				),
				title: translate( 'Remove paid subscribers' ),
		  };

	const { action, confirmButtonLabel, text, title } = someSubscriberHasPlans
		? paidSubscriberProps
		: freeSubscriberProps;

	useEffect( () => {
		if ( subscriber ) {
			recordRemoveModal( someSubscriberHasPlans, 'modal_showed' );
		}
	}, [ recordRemoveModal, someSubscriberHasPlans, subscriber ] );

	const onCancelClick = useCallback( () => {
		recordRemoveModal( someSubscriberHasPlans, 'modal_dismissed' );
		onCancel();
	}, [ someSubscriberHasPlans, onCancel ] );

	return (
		<ConfirmModal
			isVisible={ !! subscriber }
			confirmButtonLabel={ confirmButtonLabel }
			text={ text }
			title={ title }
			onCancel={ onCancelClick }
			onConfirm={ () => onConfirm( action, subscribers ) }
		/>
	);
};

export default UnsubscribeModal;
