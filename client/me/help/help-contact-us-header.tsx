import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import type { FC } from 'react';

import './style.scss';
const HELP_CENTER_STORE = HelpCenter.register();

const HelpContactUsHeader: FC = () => {
	const { __ } = useI18n();
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { url } = useStillNeedHelpURL();

	const onClick = () => {
		recordTracksEvent( 'calypso_help_header_button_click' );
		setNavigateToRoute( url );
		setShowHelpCenter( true );
	};

	return (
		<div className="help__contact-us-header-button">
			<Button onClick={ onClick }>{ __( 'Contact support' ) }</Button>
		</div>
	);
};

export default HelpContactUsHeader;
