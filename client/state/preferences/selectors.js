
export const isFetchingPreferences = state => ( !! state.preferences.isFetching );

export const getPreference = ( state, key ) => state.preferences.values[ key ];
