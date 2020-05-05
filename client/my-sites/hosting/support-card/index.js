/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { Button, Card } from '@automattic/components';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HappinessEngineersTray from 'components/happiness-engineers-tray';
import CardHeading from 'components/card-heading';
import {
	withAnalytics,
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';

/**
 * Style dependencies
 */
import './style.scss';

const SupportCard = ( { translate, navigateToContactSupport } ) => {
	return (
		<Card className="support-card">
			<CardHeading>{ translate( 'Support' ) }</CardHeading>
			<HappinessEngineersTray />
			<p>
				{ translate(
					'If you need help or have any questions, our Happiness Engineers are here when you need them.'
				) }
			</p>
			<Button onClick={ navigateToContactSupport } href={ '/help/contact/' }>
				{ translate( 'Contact us' ) }
			</Button>
		</Card>
	);
};

const navigateToContactSupport = ( event ) => {
	event.preventDefault();
	return withAnalytics(
		composeAnalytics(
			recordGoogleEvent( 'Hosting Configuration', 'Clicked "Contact us" Button in Support card' ),
			recordTracksEvent( 'calypso_hosting_configuration_contact_support' ),
			bumpStat( 'hosting-config', 'contact-support' )
		),
		navigate( '/help/contact/' )
	);
};

export default connect( null, { navigateToContactSupport } )( localize( SupportCard ) );
