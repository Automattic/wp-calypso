import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { createElement, useRef, useEffect } from 'react';
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
	EDUCATION_BLOGGING_QUICK_START,
} from 'calypso/my-sites/customer-home/cards/constants';
import BloggingQuickStart from 'calypso/my-sites/customer-home/cards/education/blogging-quick-start';
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
	[ EDUCATION_BLOGGING_QUICK_START ]: BloggingQuickStart,
};

const LearnGrow = () => {
	const cards = useLearnGrowCards();
	const dispatch = useDispatch();
	const viewedCards = useRef( new Set() );

	const handlePageSelected = ( index ) => {
		const selectedCard = cards && cards[ index ];
		if ( viewedCards.current.has( selectedCard ) ) {
			return;
		}

		viewedCards.current.add( selectedCard );
		dispatch( trackCardImpression( selectedCard ) );
	};

	useEffect( () => handlePageSelected( 0 ) );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<DotPager
			className="learn-grow__content customer-home__card"
			hasDynamicHeight
			onPageSelected={ handlePageSelected }
		>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					createElement( cardComponents[ card ], {
						key: index,
					} )
			) }
		</DotPager>
	);
};

function useLearnGrowCards() {
	const siteId = useSelector( getSelectedSiteId );
	const { data: layout } = useHomeLayoutQuery( siteId, { enabled: false } );
	const { localeSlug } = useTranslate();

	let allCards = layout?.[ 'secondary.learn-grow' ] ?? [];

	const isEnglish = config( 'english_locales' ).includes( localeSlug );

	if ( ! isEnglish ) {
		allCards = allCards.filter( ( card ) => card !== EDUCATION_WPCOURSES );
	}

	// Remove cards we don't know how to deal with on the client-side
	return allCards.filter( ( card ) => !! cardComponents[ card ] );
}

function trackCardImpression( card ) {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
		bumpStat( 'calypso_customer_home_card_impression', card )
	);
}

export default LearnGrow;
