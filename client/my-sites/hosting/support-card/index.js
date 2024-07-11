import { Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from '@wordpress/data';
import { HostingCard } from 'calypso/components/hosting-card';
import {
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';

import './style.scss';

function trackNavigateToContactSupport() {
	return composeAnalytics(
		recordGoogleEvent( 'Hosting Configuration', 'Clicked "Contact us" Button in Support card' ),
		recordTracksEvent( 'calypso_hosting_configuration_contact_support' ),
		bumpStat( 'hosting-config', 'contact-support' )
	);
}

const HELP_CENTER_STORE = HelpCenter.register();

export default function SupportCard() {
	const translate = useTranslate();
	const { setShowHelpCenter, setInitialRoute } = useDispatch( HELP_CENTER_STORE );
	const { url } = useStillNeedHelpURL();

	const onClick = () => {
		setInitialRoute( url );
		setShowHelpCenter( true );
	};

	return (
		<HostingCard className="support-card" title={ translate( 'Need some help?' ) }>
			<p>{ translate( 'Our AI assistant can help, or connect you to our support team.' ) }</p>
			<Button onClick={ onClick }>{ translate( 'Get help' ) }</Button>
		</HostingCard>
	);
}
