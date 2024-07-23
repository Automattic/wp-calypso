import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, CompactCard, Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import type { FC } from 'react';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

const HelpContactUsFooter: FC = () => {
	const { __ } = useI18n();
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { url } = useStillNeedHelpURL();

	const onClick = () => {
		recordTracksEvent( 'calypso_help_footer_button_click' );
		setNavigateToRoute( url );
		setShowHelpCenter( true );
	};

	return (
		<>
			<h2 className="help__section-title">{ __( 'Contact Us' ) }</h2>
			<CompactCard className="help__contact-us-card" onClick={ onClick }>
				<Gridicon icon="help" size={ 36 } />
				<div className="help__contact-us-section">
					<h3 className="help__contact-us-title">{ __( 'Contact support' ) }</h3>
					<p className="help__contact-us-content">
						{ __( "Can't find the answer? Drop us a line and we'll lend a hand." ) }
					</p>
				</div>
				<Button primary className="help__contact-us-button">
					{ __( 'Contact support' ) }
				</Button>
			</CompactCard>
		</>
	);
};

export default HelpContactUsFooter;
