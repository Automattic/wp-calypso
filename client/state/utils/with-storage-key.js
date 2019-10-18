export const withStorageKey = ( storageKey, reducer ) => {
	reducer.storageKey = storageKey;
	return reducer;
};
