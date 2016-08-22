/** @ssr-ready **/

export const fetchingPreferences = state => ( !! state.currentUser.settings.requesting );

export const getPreference = ( state, key ) => state.preferences.values[ key ];

export const preferencesLastFetchedTimestamp = state => ( state.preferences.lastFetchedTimestamp );
