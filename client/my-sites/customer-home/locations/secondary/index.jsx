/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Stats from 'my-sites/customer-home/cards/features/stats';
import LearnGrow from './learn-grow';
import { FEATURE_STATS, SECTION_LEARN_GROW } from 'my-sites/customer-home/cards/constants';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

const cardComponents = {
	[ FEATURE_STATS ]: Stats,
	[ SECTION_LEARN_GROW ]: LearnGrow,
};

const Secondary = ( { cards, renderCard } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return <>{ cards.map( renderCard ) }</>;
};

export default connect( null, ( dispatch ) => ( {
	renderCard: ( card ) =>
		cardComponents[ card ] &&
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_card_impression', {
						card,
					} ),
					bumpStat( 'calypso_customer_home_card_impression', card )
				),
				React.createElement( cardComponents[ card ], {
					key: card,
				} )
			)
		),
} ) )( Secondary );
