import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import type { FC } from 'react';

const HELP_CENTER_STORE = HelpCenter.register();

type Props = {
	isLink?: boolean;
	skipToContactOptions?: boolean;
};

const SupportButton: FC< Props > = ( {
	isLink = true,
	children,
	skipToContactOptions = false,
} ) => {
	const { __ } = useI18n();
	const { setInitialRoute, setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );

	function handleClick() {
		if ( skipToContactOptions ) {
			setInitialRoute( '/contact-options' );
		}
		setShowHelpCenter( true );
		recordTracksEvent( 'calypso_support_button_click', {
			skip_to_contact_options: skipToContactOptions,
		} );
	}

	return (
		<Button borderless={ isLink } onClick={ handleClick }>
			{ children || __( 'Contact support' ) }
		</Button>
	);
};

export default SupportButton;
