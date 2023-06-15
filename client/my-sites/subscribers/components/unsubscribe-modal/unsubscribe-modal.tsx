import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Subscriber } from '../../types';
import './styles.scss';

export enum UnsubscribeActionType {
	Cancel = 'cancel',
	Manage = 'manage',
	Unsubscribe = 'unsubscribe',
}

type UnsubscribeModalProps = {
	subscriber?: Subscriber;
	onClose: ( action: UnsubscribeActionType, subscriber?: Subscriber ) => void;
};

const UnsubscribeModal = ( { subscriber, onClose }: UnsubscribeModalProps ) => {
	const translate = useTranslate();
	const subscriberHasPlans = !! subscriber?.plans?.length;

	const title = subscriberHasPlans
		? translate( 'Remove paid subscriber' )
		: translate( 'Remove free subscriber' );

	const confirmButtonLabel = subscriberHasPlans
		? translate( 'Manage paid subscribers', { context: 'Navigate to the Earns page button text.' } )
		: translate( 'Remove subscriber', { context: 'Confirm Unsubscribe subscriber button text.' } );

	const confirmMessage = subscriberHasPlans
		? translate( 'To remove this subscriber, you’ll need to cancel their paid subscription first.' )
		: translate(
				'Are you sure you want to remove %s from your list? They will no longer receive new notifications from your site.',
				{
					args: [ subscriber?.display_name ],
					comment: "%s is the subscriber's public display name",
				}
		  );

	const confirmActionType = subscriberHasPlans
		? UnsubscribeActionType.Manage
		: UnsubscribeActionType.Unsubscribe;

	const onCloseHandler = ( action?: string ) => {
		if ( action === UnsubscribeActionType.Unsubscribe ) {
			onClose( UnsubscribeActionType.Unsubscribe, subscriber );
		} else if ( action === UnsubscribeActionType.Manage ) {
			onClose( UnsubscribeActionType.Manage, subscriber );
		} else {
			onClose( UnsubscribeActionType.Cancel );
		}
	};

	if ( ! subscriber ) {
		return null;
	}

	return (
		<Modal
			overlayClassName="unsubscribe-modal"
			title={ title }
			onRequestClose={ () => onCloseHandler( UnsubscribeActionType.Cancel ) }
		>
			<p>{ confirmMessage }</p>
			<div className="unsubscribe-modal__buttons">
				<Button
					className="unsubscribe-modal__cancel"
					onClick={ () => onCloseHandler( UnsubscribeActionType.Cancel ) }
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button onClick={ () => onCloseHandler( confirmActionType ) } primary>
					{ confirmButtonLabel }
				</Button>
			</div>
		</Modal>
	);
};

export default UnsubscribeModal;
