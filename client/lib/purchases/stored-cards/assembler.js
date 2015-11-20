function createStoredCardsArray( dataTransferObject ) {
	if ( ! Array.isArray( dataTransferObject ) ) {
		return [];
	}

	return dataTransferObject.map( card => {
		return {
			id: Number( card.stored_details_id ),
			expiry: card.expiry,
			number: Number( card.card ),
			type: card.card_type,
			name: card.name
		}
	} );
}

export default {
	createStoredCardsArray
};
