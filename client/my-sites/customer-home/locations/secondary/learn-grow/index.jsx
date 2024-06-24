import config from '@automattic/calypso-config';
import { DotPager } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { createElement, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import {
	EDUCATION_AFFILIATES,
	EDUCATION_FREE_PHOTO_LIBRARY,
	EDUCATION_EARN,
	EDUCATION_STORE,
	EDUCATION_WPCOURSES,
	EDUCATION_FIND_SUCCESS,
	EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK,
	EDUCATION_BLOGGING_QUICK_START,
	EDUCATION_PROMOTE_POST,
	EDUCATION_SITE_EDITOR_QUICK_START,
} from 'calypso/my-sites/customer-home/cards/constants';
import EducationAffiliates from 'calypso/my-sites/customer-home/cards/education/affiliates';
import BloggingQuickStart from 'calypso/my-sites/customer-home/cards/education/blogging-quick-start';
import EducationEarn from 'calypso/my-sites/customer-home/cards/education/earn';
import FindSuccess from 'calypso/my-sites/customer-home/cards/education/find-success';
import FreePhotoLibrary from 'calypso/my-sites/customer-home/cards/education/free-photo-library';
import PromotePost from 'calypso/my-sites/customer-home/cards/education/promote-post';
// eslint-disable-next-line inclusive-language/use-inclusive-words
import RespondToCustomerFeedback from 'calypso/my-sites/customer-home/cards/education/respond-to-customer-feedback';
import SiteEditorQuickStart from 'calypso/my-sites/customer-home/cards/education/site-editor-quick-start';
import EducationStore from 'calypso/my-sites/customer-home/cards/education/store';
import WpCourses from 'calypso/my-sites/customer-home/cards/education/wpcourses';
import trackMyHomeCardImpression, {
	CardLocation,
} from 'calypso/my-sites/customer-home/track-my-home-card-impression';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const cardComponents = {
	[ EDUCATION_AFFILIATES ]: EducationAffiliates,
	[ EDUCATION_FREE_PHOTO_LIBRARY ]: FreePhotoLibrary,
	[ EDUCATION_EARN ]: EducationEarn,
	[ EDUCATION_STORE ]: EducationStore,
	[ EDUCATION_WPCOURSES ]: WpCourses,
	[ EDUCATION_PROMOTE_POST ]: PromotePost,
	[ EDUCATION_FIND_SUCCESS ]: FindSuccess,
	[ EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK ]: RespondToCustomerFeedback,
	[ EDUCATION_BLOGGING_QUICK_START ]: BloggingQuickStart,
	[ EDUCATION_SITE_EDITOR_QUICK_START ]: SiteEditorQuickStart,
};

const LearnGrow = () => {
	const cards = useLearnGrowCards();
	const viewedCards = useRef( new Set() );

	const handlePageSelected = ( index ) => {
		const selectedCard = cards && cards[ index ];
		if ( viewedCards.current.has( selectedCard ) ) {
			return;
		}

		viewedCards.current.add( selectedCard );
		trackMyHomeCardImpression( { card: selectedCard, location: CardLocation.SECONDARY } );
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
					cardComponents[ card ].isDisabled !== true &&
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

	// eslint-disable-next-line wpcalypso/i18n-translate-identifier
	const { localeSlug } = useTranslate();

	let allCards = layout?.[ 'secondary.learn-grow' ] ?? [];

	const isEnglish = config( 'english_locales' ).includes( localeSlug );

	if ( ! isEnglish ) {
		allCards = allCards.filter( ( card ) => card !== EDUCATION_WPCOURSES );
	}

	// Remove cards we don't know how to deal with on the client-side
	return allCards.filter( ( card ) => !! cardComponents[ card ] );
}

export default LearnGrow;
