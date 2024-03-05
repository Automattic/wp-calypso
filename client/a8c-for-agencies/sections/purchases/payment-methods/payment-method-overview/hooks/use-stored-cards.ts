export default function useStoredCards() {
	return {
		allStoredCards: [],
		primaryStoredCard: null,
		secondaryStoredCards: [],
		isFetching: false,
		pageSize: 0,
		hasStoredCards: false,
		hasMoreStoredCards: false,
	};
}
