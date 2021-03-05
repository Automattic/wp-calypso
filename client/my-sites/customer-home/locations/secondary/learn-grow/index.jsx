/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'calypso/my-sites/customer-home/cards/education/free-photo-library';
// eslint-disable-next-line inclusive-language/use-inclusive-words
import MasteringGutenberg from 'calypso/my-sites/customer-home/cards/education/mastering-gutenberg';
import EducationEarn from 'calypso/my-sites/customer-home/cards/education/earn';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getHomeLayout } from 'calypso/state/selectors/get-home-layout';
import {
	EDUCATION_FREE_PHOTO_LIBRARY,
	EDUCATION_GUTENBERG,
	EDUCATION_EARN,
} from 'calypso/my-sites/customer-home/cards/constants';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const cardComponents = {
	[ EDUCATION_FREE_PHOTO_LIBRARY ]: FreePhotoLibrary,
	[ EDUCATION_GUTENBERG ]: MasteringGutenberg,
	[ EDUCATION_EARN ]: EducationEarn,
};

const LearnGrow = ( { cards, trackCards } ) => {
	useEffect( () => {
		if ( cards && cards.length ) {
			trackCards( cards );
		}
	}, [ cards, trackCards ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			<Card className="learn-grow__content">
				{ cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		cards: layout?.[ 'secondary.learn-grow' ] ?? [],
	};
};

const trackCardImpressions = ( cards ) => {
	const analyticsEvents = cards.reduce( ( events, card ) => {
		return [
			...events,
			recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
			bumpStat( 'calypso_customer_home_card_impression', card ),
		];
	}, [] );
	return composeAnalytics( ...analyticsEvents );
};

export default connect( mapStateToProps, { trackCards: trackCardImpressions } )( LearnGrow );
