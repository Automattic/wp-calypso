/** @ssr-ready **/
export const fetchingPreferences = state => ( !! state.preferences.fetching );

export const getPreference = ( state, key ) => state.preferences.values[ key ];
