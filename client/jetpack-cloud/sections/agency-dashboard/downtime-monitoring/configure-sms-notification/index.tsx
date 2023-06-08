import { Button } from '@automattic/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

interface Props {
	toggleModal: () => void;
}

export default function ConfigureSMSNotification( { toggleModal }: Props ) {
	const translate = useTranslate();

	const handleAddEmailClick = () => {
		// Record event
		toggleModal();
	};

	return (
		<div className="configure-contact__card-container">
			<Button
				compact
				className="configure-contact__button"
				onClick={ handleAddEmailClick }
				aria-label={ translate( 'Add phone number' ) }
			>
				<Icon size={ 18 } icon={ plus } />
				{ translate( 'Add phone number' ) }
			</Button>
		</div>
	);
}
