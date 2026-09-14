import { useTranslate } from 'i18n-calypso';
import ConfirmModal from 'calypso/components/confirm-modal';

type UnsubscribePaidConfirmModalProps = {
	isVisible: boolean;
	siteName: string;
	onCancel: () => void;
	onConfirm: () => void;
};

const UnsubscribePaidConfirmModal = ( {
	isVisible,
	siteName,
	onCancel,
	onConfirm,
}: UnsubscribePaidConfirmModalProps ) => {
	const translate = useTranslate();

	const text = translate(
		'This will unsubscribe you from %(siteName)s emails, but you can still get updates through the Reader. Your paid plan is still active. To cancel the subscription, you’ll also need to {{a}}manage your subscription{{/a}}.',
		{
			args: { siteName },
			components: {
				a: (
					<a href="/me/purchases" target="_blank" rel="noopener noreferrer">
						manage your subscription
					</a>
				),
			},
			comment:
				'Confirmation shown before unsubscribing a paid newsletter subscriber. The link opens the purchases page where the user can cancel the paid plan separately.',
		}
	);

	return (
		<ConfirmModal
			isVisible={ isVisible }
			confirmButtonLabel={ translate( 'Unsubscribe' ) }
			text={ text }
			title={ translate( 'Unsubscribe from %(siteName)s?', { args: { siteName } } ) as string }
			onCancel={ onCancel }
			onConfirm={ onConfirm }
		/>
	);
};

export default UnsubscribePaidConfirmModal;
