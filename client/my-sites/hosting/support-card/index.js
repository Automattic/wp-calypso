import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { HostingCard } from 'calypso/components/hosting-card';
import {
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';

import './style.scss';

function trackNavigateToContactSupport() {
	return composeAnalytics(
		recordGoogleEvent( 'Hosting Configuration', 'Clicked "Contact us" Button in Support card' ),
		recordTracksEvent( 'calypso_hosting_configuration_contact_support' ),
		bumpStat( 'hosting-config', 'contact-support' )
	);
}

export default function SupportCard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return (
		<HostingCard className="support-card" title={ translate( 'Need some help?' ) }>
			<p>{ translate( 'Our AI assistant can help, or connect you to our support team.' ) }</p>
			<Button onClick={ () => dispatch( trackNavigateToContactSupport() ) } href="/help/contact">
				{ translate( 'Get help' ) }
			</Button>
		</HostingCard>
	);
}
