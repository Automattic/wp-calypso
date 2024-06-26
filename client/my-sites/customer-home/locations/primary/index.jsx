import { DotPager } from '@automattic/components';
import clsx from 'clsx';
import { createElement, useEffect, useRef } from 'react';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import {
	PRIMARY_CARD_COMPONENTS,
	isUrgentCard,
} from 'calypso/my-sites/customer-home/locations/card-components';
import trackMyHomeCardImpression, {
	CardLocation,
} from 'calypso/my-sites/customer-home/track-my-home-card-impression';

const Primary = ( { cards } ) => {
	const viewedCards = useRef( new Set() );

	const handlePageSelected = ( index ) => {
		if ( ! cards || ! cards.length || ! cards[ index ] ) {
			return;
		}

		const selectedCard = cards && cards[ index ];
		if ( viewedCards.current.has( selectedCard ) ) {
			return;
		}

		viewedCards.current.add( selectedCard );
		trackMyHomeCardImpression( { card: selectedCard, location: CardLocation.PRIMARY } );
	};

	useEffect( () => handlePageSelected( 0 ), [ cards ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	let isUrgent = false;
	if ( cards.length === 1 ) {
		isUrgent = isUrgentCard( cards[ 0 ] );
	}

	return (
		<DotPager
			className={ clsx( 'primary__customer-home-location-content', {
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

export default withPerformanceTrackerStop( Primary );
