/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import HappinessEngineersTray from 'calypso/components/happiness-engineers-tray';
import CardHeading from 'calypso/components/card-heading';
import {
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
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
		<Card className="support-card">
			<CardHeading>{ translate( 'Support' ) }</CardHeading>
			<HappinessEngineersTray />
			<p>
				{ translate(
					'If you need help or have any questions, our Happiness Engineers are here when you need them.'
				) }
			</p>
			<Button onClick={ () => dispatch( trackNavigateToContactSupport ) } href="/help/contact">
				{ translate( 'Contact us' ) }
			</Button>
		</Card>
	);
}
