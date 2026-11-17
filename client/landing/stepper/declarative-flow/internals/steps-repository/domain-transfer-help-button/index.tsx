import { useViewportMatch } from '@wordpress/compose';
import { help } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import ChatButton from 'calypso/components/chat-button';

const DomainTransferHelpButton = () => {
	const { __ } = useI18n();
	const isMobileViewport = useViewportMatch( 'small', '<' );

	return (
		<ChatButton
			chatIntent="SUPPORT"
			initialMessage="User is contacting us from the domains-transfer flow"
			withHelpCenter={ false }
			section="domains-transfer"
			icon={ help }
			iconSize={ 20 }
		>
			{ isMobileViewport ? __( 'Help' ) : __( 'Need help?' ) }
		</ChatButton>
	);
};

export default DomainTransferHelpButton;
