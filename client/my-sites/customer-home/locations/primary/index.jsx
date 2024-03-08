import classnames from 'classnames';
import { createElement, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import DotPager from 'calypso/components/dot-pager';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import {
	PRIMARY_CARD_COMPONENTS,
	isUrgentCard,
} from 'calypso/my-sites/customer-home/locations/card-components';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

const Primary = ( { cards, trackCard } ) => {
	const viewedCards = useRef( new Set() );

	const handlePageSelected = ( index ) => {
		const selectedCard = cards && cards[ index ];
		if ( viewedCards.current.has( selectedCard ) ) {
			return;
		}

		viewedCards.current.add( selectedCard );
		trackCard( selectedCard );
	};

	useEffect( () => handlePageSelected( 0 ) );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	let isUrgent = false;
	if ( cards.length === 1 ) {
		isUrgent = isUrgentCard( cards[ 0 ] );
	}

	return (
		<DotPager
			className={ classnames( 'primary__customer-home-location-content', {
				'primary__is-urgent': isUrgent,
			} ) }
			showControlLabels="true"
			hasDynamicHeight
			onPageSelected={ handlePageSelected }
		>
			{ cards.map(
				( card, index ) =>
					PRIMARY_CARD_COMPONENTS[ card ] &&
					! PRIMARY_CARD_COMPONENTS[ card ].isDisabled &&
					createElement( PRIMARY_CARD_COMPONENTS[ card ], {
						key: card + index,
						isIos: card === 'home-task-go-mobile-ios' ? true : null,
						card,
					} )
			) }
		</DotPager>
	);
};

const trackCardImpression = ( card ) => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
		bumpStat( 'calypso_customer_home_card_impression', card )
	);
};

export default withPerformanceTrackerStop(
	connect( null, { trackCard: trackCardImpression } )( Primary )
);
