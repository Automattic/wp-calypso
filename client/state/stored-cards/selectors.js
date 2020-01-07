/**
 * Return user's stored cards from state object
 *
 *
 * @param {object} state - current state object
 * @returns {Array} Stored Cards
 */

export const getStoredCards = state => state.storedCards.items;

/**
 * Returns a Stored Card
 * @param  {object} state      global state
 * @param  {number} cardId  the card id
 * @returns {object} the matching card if there is one
 */
export const getStoredCardById = ( state, cardId ) =>
	getStoredCards( state )
		.filter( card => card.stored_details_id === cardId )
		.shift();

export const hasLoadedStoredCardsFromServer = state => state.storedCards.hasLoadedFromServer;

export const isDeletingStoredCard = ( state, cardId ) =>
	Boolean( state.storedCards.isDeleting[ cardId ] );
export const isFetchingStoredCards = state => state.storedCards.isFetching;
