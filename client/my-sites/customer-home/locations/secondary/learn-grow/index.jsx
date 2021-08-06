import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import {
	EDUCATION_FREE_PHOTO_LIBRARY,
	EDUCATION_GUTENBERG,
	EDUCATION_EARN,
	EDUCATION_WPCOURSES,
	EDUCATION_FIND_SUCCESS,
	EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK,
} from 'calypso/my-sites/customer-home/cards/constants';
import EducationEarn from 'calypso/my-sites/customer-home/cards/education/earn';
import FindSuccess from 'calypso/my-sites/customer-home/cards/education/find-success';
import FreePhotoLibrary from 'calypso/my-sites/customer-home/cards/education/free-photo-library';
// eslint-disable-next-line inclusive-language/use-inclusive-words
import MasteringGutenberg from 'calypso/my-sites/customer-home/cards/education/mastering-gutenberg';
import RespondToCustomerFeedback from 'calypso/my-sites/customer-home/cards/education/respond-to-customer-feedback';
import WpCourses from 'calypso/my-sites/customer-home/cards/education/wpcourses';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const cardComponents = {
	[ EDUCATION_FREE_PHOTO_LIBRARY ]: FreePhotoLibrary,
	[ EDUCATION_GUTENBERG ]: MasteringGutenberg,
	[ EDUCATION_EARN ]: EducationEarn,
	[ EDUCATION_WPCOURSES ]: WpCourses,
	[ EDUCATION_FIND_SUCCESS ]: FindSuccess,
	[ EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK ]: RespondToCustomerFeedback,
};

const LearnGrow = () => {
	const cards = useLearnGrowCards();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( cards && cards.length ) {
			dispatch( trackCardImpressions( cards ) );
		}
	}, [ cards, dispatch ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<DotPager className="learn-grow__content customer-home__card" hasDynamicHeight>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					React.createElement( cardComponents[ card ], {
						key: index,
					} )
			) }
		</DotPager>
	);
};

function useLearnGrowCards() {
	const siteId = useSelector( getSelectedSiteId );
	const { data: layout } = useHomeLayoutQuery( siteId, { enabled: false } );

	const allCards = layout?.[ 'secondary.learn-grow' ] ?? [];

	// Remove cards we don't know how to deal with on the client-side
	return allCards.filter( ( card ) => !! cardComponents[ card ] );
}

function trackCardImpressions( cards ) {
	const analyticsEvents = cards.reduce( ( events, card ) => {
		return [
			...events,
			recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
			bumpStat( 'calypso_customer_home_card_impression', card ),
		];
	}, [] );
	return composeAnalytics( ...analyticsEvents );
}

export default LearnGrow;
