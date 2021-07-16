/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'calypso/my-sites/customer-home/cards/education/free-photo-library';
// eslint-disable-next-line inclusive-language/use-inclusive-words
import MasteringGutenberg from 'calypso/my-sites/customer-home/cards/education/mastering-gutenberg';
import EducationEarn from 'calypso/my-sites/customer-home/cards/education/earn';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	EDUCATION_FREE_PHOTO_LIBRARY,
	EDUCATION_GUTENBERG,
	EDUCATION_EARN,
	EDUCATION_WPCOURSES,
} from 'calypso/my-sites/customer-home/cards/constants';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import WpCourses from 'calypso/my-sites/customer-home/cards/education/wpcourses';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import DotPager from 'calypso/components/dot-pager';

const cardComponents = {
	[ EDUCATION_FREE_PHOTO_LIBRARY ]: FreePhotoLibrary,
	[ EDUCATION_GUTENBERG ]: MasteringGutenberg,
	[ EDUCATION_EARN ]: EducationEarn,
	[ EDUCATION_WPCOURSES ]: WpCourses,
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
		<DotPager className="learn-grow__content customer-home__card">
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

	return layout?.[ 'secondary.learn-grow' ] ?? [];
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
