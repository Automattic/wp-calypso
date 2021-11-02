import { Modal } from '@wordpress/components';
import { Icon, wordpress } from '@wordpress/icons';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import HelpComponent from 'calypso/me/help/main';
import './style.scss';

const HelpCentertModal = ( { isOpen } ) => {
	const translate = useTranslate();

	const onClose = () =>
		page.redirect(
			removeQueryArgs( window.location.pathname + window.location.search, 'showHelpCenter' )
		);

	return (
		isOpen && (
			<Modal
				overlayClassName="help-center-modal"
				onRequestClose={ onClose }
				title={ String( translate( 'Help Center' ) ) }
				shouldCloseOnClickOutside={ false }
				icon={ <Icon icon={ wordpress } size={ 29 } /> }
			>
				<HelpComponent />
			</Modal>
		)
	);
};

export default HelpCentertModal;
