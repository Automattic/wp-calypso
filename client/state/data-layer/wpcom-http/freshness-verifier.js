export const CLEAN_OLDER_THAN = 3 * 60 * 1000;

/** @type {Date} holds timestamp of the last time a cleaning operation was performed */
let lastCleaningTime;

/** @type {Map} holds request action keys, and last execution times */
const history = new Map();

/**
 * Generate a deterministic key for comparing request actions
 *
 * @param   {Object} action redux action
 * @returns {String}        action key
 */
const buildActionKey = ( action ) => JSON.stringify(
	action.meta ? { ...action, meta: undefined } : action
);

/**
 * Performs a cleaning operation in the data structure used to hold action keys and execution times
 * this is useful to reduce memory usage in the structure
 * by cleaning requests that are very old and irrelevant to the freshness mechanism
 */
export const cleanHistoryIfNecessary = () => {
	const now = Date.now();
	if ( lastCleaningTime && now - lastCleaningTime < CLEAN_OLDER_THAN ) {
		return;
	}
	lastCleaningTime = now;
	history.forEach( ( lastExecutionTime, key ) => {
		if ( now - lastExecutionTime > CLEAN_OLDER_THAN ) {
			history.delete( key );
		}
	} );
};

/**
 * Abort a request if our data is fresh-enough
 *
 * @param {Function}   initiator issues actual network requests
 * @param {Number}     freshness number of milliseconds since the last execution for the request be considered fresh
 * @returns {Function}           wrapped request initiator
 */
export const initiatorWithFreshness = ( initiator, freshness ) => ( store, action, next, ignoreAction ) => {
	const lastUpdate = history.get( buildActionKey( action ) ) || -Infinity;
	const now = Date.now();

	const staleness = now - lastUpdate;

	// our data is fresher than we need it to be
	// so just skip this fetch and discard the action
	if ( staleness <= freshness ) {
		ignoreAction();
		return;
	}
	return initiator( store, action, next );
};

/**
 * Wraps onSuccess with functionality needed for freshness mechanism
 *
 * @param {Function}   onSuccess actual onSuccess function
 * @returns {Function}           wrapped onSuccess function
 */
export const onSuccessWithFreshness = ( onSuccess ) => ( store, action, next, data ) => {
	cleanHistoryIfNecessary();
	history.set( buildActionKey( action ), Date.now() );
	return onSuccess( store, action, next, data );
};
