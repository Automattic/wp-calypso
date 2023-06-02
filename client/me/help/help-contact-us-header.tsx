import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import type { FC } from 'react';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

const HelpContactUsHeader: FC = () => {
	const { __ } = useI18n();
	const { setShowHelpCenter, setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const onClick = () => {
		recordTracksEvent( 'calypso_help_header_button_click' );
		setInitialRoute( '/contact-options' );
		setShowHelpCenter( true );
	};

	return (
		<div className="help__contact-us-header-button">
			<Button onClick={ onClick }>{ __( 'Contact support' ) }</Button>
		</div>
	);
};

export default HelpContactUsHeader;
