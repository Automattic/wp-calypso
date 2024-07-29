import { DotPager } from '@automattic/components';
import { createElement, useEffect } from 'react';
import {
	SECTION_BLOGGING_PROMPT,
	SECTION_BLOGANUARY_BLOGGING_PROMPT,
	TASK_GO_MOBILE_IOS,
} from 'calypso/my-sites/customer-home/cards/constants';
import {
	CARD_COMPONENTS,
	PRIMARY_CARD_COMPONENTS,
} from 'calypso/my-sites/customer-home/locations/card-components';
import trackMyHomeCardImpression, {
	CardLocation,
} from 'calypso/my-sites/customer-home/track-my-home-card-impression';

const getAdditionalPropsForCard = ( { card, siteId } ) => {
	if ( card === SECTION_BLOGGING_PROMPT || card === SECTION_BLOGANUARY_BLOGGING_PROMPT ) {
		return {
			siteId,
			showMenu: true,
			viewContext: 'home',
		};
	}

	const additionalProps = {};

	if ( PRIMARY_CARD_COMPONENTS[ card ] ) {
		additionalProps.card = card;
	}
	if ( card === TASK_GO_MOBILE_IOS ) {
		additionalProps.isIos = true;
	}

	return additionalProps;
};

const SecondaryCard = ( { card, siteId } ) => {
	if ( CARD_COMPONENTS[ card ] ) {
		return createElement( CARD_COMPONENTS[ card ], {
			...getAdditionalPropsForCard( { card, siteId } ),
		} );
	}

	return null;
};

const Secondary = ( { cards, siteId, trackFirstCardAsPrimary = false } ) => {
	let shouldTrackCardAsPrimary = trackFirstCardAsPrimary;

	const trackMyHomeCardImpressionWithFlexibleLocation = ( card ) => {
		const location = shouldTrackCardAsPrimary ? CardLocation.PRIMARY : CardLocation.SECONDARY;
		shouldTrackCardAsPrimary = false;

		trackMyHomeCardImpression( { card, location } );
	};

	useEffect( () => {
		if ( ! cards || ! cards.length ) {
			return;
		}

		cards.forEach( ( card ) => {
			if ( Array.isArray( card ) && card.length > 0 ) {
				return;
			}

			trackMyHomeCardImpressionWithFlexibleLocation( card );
		} );
	}, [ cards ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map( ( card, index ) => {
				if ( Array.isArray( card ) && card.length > 0 ) {
					const trackInnerCardImpression = ( innerCardIndex ) =>
						trackMyHomeCardImpressionWithFlexibleLocation( card[ innerCardIndex ] );

					return (
						<DotPager
							key={ 'my_home_secondary_pager_' + index }
							className="secondary__customer-home-location-content"
							showControlLabels="true"
							hasDynamicHeight
							onPageSelected={ trackInnerCardImpression }
						>
							{ card.map( ( innerCard, innerIndex ) => {
								return (
									<SecondaryCard
										key={ 'my_home_secondary_pager_' + index + '_' + card + '_' + innerIndex }
										card={ innerCard }
										siteId={ siteId }
									/>
								);
							} ) }
						</DotPager>
					);
				}

				return (
					<SecondaryCard
						key={ 'my_home_secondary_' + card + '_' + index }
						card={ card }
						siteId={ siteId }
					/>
				);
			} ) }
		</>
	);
};

export default Secondary;
