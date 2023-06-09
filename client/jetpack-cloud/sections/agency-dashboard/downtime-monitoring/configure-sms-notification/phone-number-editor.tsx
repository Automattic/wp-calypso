import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	toggleModal: () => void;
}

export default function PhoneNumberEditor( { toggleModal }: Props ) {
	const translate = useTranslate();

	const onSave = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		// Handle save here
	};

	const title = translate( 'Add your phone number' );
	const subTitle = translate( 'Please use an accessible phone number. Only alerts sent.' );

	return (
		<Modal
			open={ true }
			onRequestClose={ toggleModal }
			title={ title }
			className="notification-settings__modal"
		>
			<div className="notification-settings__sub-title">{ subTitle }</div>

			<form onSubmit={ onSave }>
				{
					// Add form fields here
				 }
			</form>
		</Modal>
	);
}
