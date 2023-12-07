import { createElement } from 'react';
import {
	SECTION_BLOGGING_PROMPT,
	TASK_GO_MOBILE_IOS,
} from 'calypso/my-sites/customer-home/cards/constants';
import {
	CARD_COMPONENTS,
	PRIMARY_CARD_COMPONENTS,
} from 'calypso/my-sites/customer-home/locations/card-components';

const getAdditionalPropsForCard = ( { card, siteId } ) => {
	if ( card === SECTION_BLOGGING_PROMPT ) {
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

const Secondary = ( { cards, siteId } ) => {
	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					CARD_COMPONENTS[ card ] &&
					createElement( CARD_COMPONENTS[ card ], {
						key: card + index,
						...getAdditionalPropsForCard( { card, siteId } ),
					} )
			) }
		</>
	);
};

export default Secondary;
