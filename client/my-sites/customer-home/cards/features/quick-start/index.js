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
	bumpStat,
} from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const QuickStartCard = ( { translate, siteSlug, bookASession } ) => {
	return (
		<Card className="quick-start">
			<HappinessEngineersTray />
			<CardHeading>{ translate( 'Schedule time with an expert' ) }</CardHeading>
			<p>
				{ translate(
					'Need help with your site? Set up a video call to get hands-on 1-on-1 support.'
				) }
			</p>
			<Button onClick={ () => bookASession( siteSlug ) }>{ translate( 'Book a session' ) }</Button>
		</Card>
	);
};

const bookASession = siteSlug => {
	return withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_book_a_session_click' ),
			bumpStat( 'calypso_customer_home', 'book_a_session' )
		),
		navigate( `/me/concierge/${ siteSlug }/book` )
	);
};

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ bookASession }
)( localize( QuickStartCard ) );
