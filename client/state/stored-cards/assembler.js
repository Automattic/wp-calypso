export const createStoredCard = card => {
	return {
		id: Number( card.stored_details_id ),
		expiry: card.expiry,
		number: Number( card.card ),
		type: card.card_type,
		name: card.name
	};
};

export const createStoredCardsArray = dataTransferArray => ( dataTransferArray || [] ).map( createStoredCard );
