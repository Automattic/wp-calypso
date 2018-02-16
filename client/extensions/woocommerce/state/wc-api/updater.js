/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import meta from './endpoints/meta';
import { clearInterval } from 'timers';

let updateTimer = null;
let lastMetaMap = {};
let nextBreach = null;

const checkUpdates = dispatch => ( now = new Date() ) => {
	let shouldUpdate = false;
	const metaMap = meta.getMetaMap();

	if ( metaMap !== lastMetaMap ) {
		lastMetaMap = metaMap;
		nextBreach = calculateNextBreach( metaMap );
		shouldUpdate = true;
	}

	if ( nextBreach && nextBreach < now ) {
		shouldUpdate = true;
	}

	if ( shouldUpdate ) {
		// Time to update.
		updateRequirements( dispatch, metaMap, now );
		nextBreach = calculateNextBreach( metaMap );
	}
};

function updateRequirements( dispatch, metaMap, now ) {
	Object.values( metaMap ).forEach( objectMeta => {
		const breachTime = calculateBreachTime( objectMeta );
		if ( breachTime && breachTime < now && ! objectMeta.lastRequest ) {
			dispatch( objectMeta.fetchAction );
		}
	} );
}

function calculateNextBreach( metaMap ) {
	return Object.values( metaMap ).reduce( ( firstBreach, objectMeta ) => {
		const breachTime = calculateBreachTime( objectMeta );
		if ( breachTime ) {
			return firstBreach && firstBreach < breachTime ? firstBreach : breachTime;
		}
		return firstBreach;
	}, null );
}

function calculateBreachTime( objectMeta ) {
	const freshness = get( objectMeta, [ 'requirements', 'freshness' ], null );
	if ( freshness ) {
		const lastData = objectMeta.lastData || null;
		if ( lastData ) {
			return new Date( lastData.getTime() + freshness );
		}
		// No data yet retrieved, it's due now then.
		return new Date();
	}
	// No freshness, no expectations.
	return null;
}

export function setUpdate( dispatch, milliseconds ) {
	// TODO: Maybe not rely on a regular update?
	// Instead, just calculate the next time an update is needed,
	// and also respond to changes in requirements.
	if ( updateTimer ) {
		clearInterval( updateTimer );
	}
	if ( milliseconds ) {
		updateTimer = setInterval( checkUpdates( dispatch ), milliseconds );
	}
}
