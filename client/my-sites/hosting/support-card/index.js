import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { HappinessEngineersTray } from 'calypso/components/happiness-engineers-tray';
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
		<HostingCard className="support-card" title={ translate( 'Support' ) }>
			<HappinessEngineersTray />
			<p>
				{ translate(
					'If you need help or have any questions, our Happiness Engineers are here when you need them.'
				) }
			</p>
			<Button onClick={ () => dispatch( trackNavigateToContactSupport() ) } href="/help/contact">
				{ translate( 'Contact us' ) }
			</Button>
		</HostingCard>
	);
}
