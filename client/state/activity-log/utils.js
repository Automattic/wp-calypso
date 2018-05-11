/** @format */

export const filterStateToQuery = ( { page } ) => ( page > 1 ? { page } : {} );

export const queryToFilterState = ( { page } ) => ( page && page > 0 ? { page } : {} );
