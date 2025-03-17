import { useTranslate, fixMe } from 'i18n-calypso';
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
	onConfirm: ( action: UnsubscribeActionType, subscribers: Subscriber[] | undefined ) => void;
};

const UnsubscribeModal = ( { subscribers, onCancel, onConfirm }: UnsubscribeModalProps ) => {
	const translate = useTranslate();
	const subscriber = subscribers?.[ 0 ];
	const someSubscriberHasPlans = !! subscribers?.some( ( subscriber ) => subscriber.plans?.length );
	const recordRemoveModal = useRecordRemoveModal();

	useEffect( () => {
		if ( subscriber ) {
			recordRemoveModal( someSubscriberHasPlans, 'modal_showed' );
		}
	}, [ recordRemoveModal, someSubscriberHasPlans, subscriber ] );

	const onCancelClick = useCallback( () => {
		recordRemoveModal( someSubscriberHasPlans, 'modal_dismissed' );
		onCancel();
	}, [ someSubscriberHasPlans, onCancel ] );

	if ( ! subscribers || ! subscribers.length ) {
		return null;
	}

	const freeSubscriberProps = {
		action: UnsubscribeActionType.Unsubscribe,
		confirmButtonLabel: fixMe( {
			text: 'Remove subscribers',
			newCopy: translate( 'Remove subscriber', 'Remove subscribers', {
				count: subscribers.length,
			} ),
			oldCopy: translate( 'Remove subscriber' ),
		} ),
		text: translate(
			'Are you sure you want to remove %(displayName)s from your list? They will no longer receive new notifications from your site.',
			'Are you sure you want to remove %(numberOfSubscribers)d subscibers from your list? They will no longer receive new notifications from your site.',
			{
				count: subscribers.length,
				args: {
					displayName: subscriber?.display_name || '',
					numberOfSubscribers: subscribers.length,
				},
			}
		),
		title: fixMe( {
			text: 'Remove free subscribers',
			newCopy: translate( 'Remove free subscriber', 'Remove free subscribers', {
				count: subscribers.length,
			} ),
			oldCopy: translate( 'Remove free subscriber' ),
		} ),
	};

	const paidSubscriberProps = {
		action: UnsubscribeActionType.Manage,
		confirmButtonLabel: fixMe( {
			text: 'Manage paid subscribers',
			newCopy: translate( 'Manage paid subscriber', 'Manage paid subscribers', {
				count: subscribers.length,
			} ),
			oldCopy: translate( 'Manage paid subscriber' ),
		} ),
		// eslint-disable-next-line wpcalypso/i18n-mismatched-placeholders
		text: translate(
			'To remove %(displayName)s from your list, you’ll need to cancel their paid subscription first.',
			'Some subscribers have paid subscriptions. To remove them from your list, you’ll need to cancel their paid subscription first.',
			{
				count: subscribers.length,
				args: {
					displayName: subscriber?.display_name || '',
				},
			}
		),
		title: fixMe( {
			text: 'Remove paid subscribers',
			newCopy: translate( 'Remove paid subscriber', 'Remove paid subscribers', {
				count: subscribers.length,
			} ),
			oldCopy: translate( 'Remove paid subscriber' ),
		} ),
	};

	const { action, confirmButtonLabel, text, title } = someSubscriberHasPlans
		? paidSubscriberProps
		: freeSubscriberProps;

	return (
		<ConfirmModal
			isVisible={ !! subscriber }
			confirmButtonLabel={ confirmButtonLabel || '' }
			text={ text }
			title={ ( title || '' ) as string }
			onCancel={ onCancelClick }
			onConfirm={ () => onConfirm( action, subscribers ) }
		/>
	);
};

export default UnsubscribeModal;
