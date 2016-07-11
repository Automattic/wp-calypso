/**
 * Return user's stored cards from state object
 *
 * @param {Object} state - current state object
 * @return {Array} Stored Cards
 */
export const getCards = state => state.storedCards.items;

/**
 * Returns a Stored Card
 * @param  {Object} state      global state
 * @param  {Number} cardId  the card id
 * @return {Object} the matching card if there is one
 */
export const getByCardId = ( state, cardId ) => (
	getCards( state ).filter( card => card.id === cardId ).shift()
);

export const isFetchingStoredCards = state => state.storedCards.isFetching;
