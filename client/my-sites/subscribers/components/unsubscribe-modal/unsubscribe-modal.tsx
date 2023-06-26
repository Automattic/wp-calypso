import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/components/confirm-modal';
import { Subscriber } from '../../types';

export enum UnsubscribeActionType {
	Manage = 'manage',
	Unsubscribe = 'unsubscribe',
}

type UnsubscribeModalProps = {
	subscriber?: Subscriber;
	onCancel: () => void;
	onConfirm: ( action: UnsubscribeActionType, subscriber?: Subscriber ) => void;
};

const UnsubscribeModal = ( { subscriber, onCancel, onConfirm }: UnsubscribeModalProps ) => {
	const translate = useTranslate();
	const subscriberHasPlans = !! subscriber?.plans?.length;

	const freeSubscriberProps = {
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
	};

	const paidSubscriberProps = {
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
	};

	const { action, confirmButtonLabel, text, title } = subscriberHasPlans
		? paidSubscriberProps
		: freeSubscriberProps;

	return (
		<ConfirmModal
			isVisible={ !! subscriber }
			confirmButtonLabel={ confirmButtonLabel }
			text={ text }
			title={ title }
			onCancel={ onCancel }
			onConfirm={ () => onConfirm( action, subscriber ) }
		/>
	);
};

export default UnsubscribeModal;
