/** @format */

/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';
import debugFactory from 'debug';
import { requestedAction } from './actions';

/**
 * Internal dependencies
 */
import { SECOND } from './constants';

const debug = debugFactory( 'rest-api-client:client' );

const MIN_UPDATE_DELAY = 5000;

const DEFAULT_REQUIREMENTS = {
	timeout: 20 * SECOND,
};

// TODO: Unit test this.
export default class ApiClient {
	constructor( apiTypeName, apiType, siteKey ) {
		this.apiTypeName = apiTypeName;
		this.apiType = apiType;
		this.siteKey = siteKey;
		this.dataRequirements = {};
		this.setSiteState( null, null );
		this.timeoutId = null;
	}

	setSiteState = ( siteState, dispatch ) => {
		this.dispatch = dispatch;

		if ( siteState !== this.siteState ) {
			const { selectors } = this.apiType;
			this.siteState = siteState;
			this.selectors = mapSelectorsToSiteState( selectors, siteState, this.requireData );
			this.updateRequirements();
		}
	};

	// TODO: Add code to clear out data requirements on re-render.
	requireData = ( endpointName, ids, requirements ) => {
		let requirementsChanged = false;
		let endpointRequirements = this.dataRequirements[ endpointName ];

		if ( ! endpointRequirements ) {
			endpointRequirements = this.dataRequirements[ endpointName ] = {};
		}

		ids.forEach( id => {
			const itemRequirements = endpointRequirements[ id ] || {};
			const newRequirements = reduceRequirements( itemRequirements, requirements );
			if ( newRequirements !== itemRequirements ) {
				endpointRequirements[ id ] = newRequirements;
				requirementsChanged = true;
			}
		} );

		if ( requirementsChanged ) {
			this.updateRequirements();
		}
	};

	updateRequirements = () => {
		const { updates, nextUpdate } = this.checkDataRequirements();

		debug( 'Updating API requirements: ', updates );

		// Only perform updates if we have a dispatch function to do it.
		if ( this.dispatch && ! isEmpty( updates ) > 0 ) {
			const endpointNames = Object.keys( updates );
			endpointNames.forEach( name => this.updateEndpointItems( name, updates[ name ] ) );
		}

		this.setNextUpdate( nextUpdate );
	};

	updateEndpointItems = ( name, ids ) => {
		const apiEndpoint = this.apiType.endpoints[ name ];
		const { fetchByIds } = apiEndpoint;

		const params = this.parseApiParams( fetchByIds.params, { ids } );
		const createAction = this.apiType.methods[ fetchByIds.method ];
		const requestAction = createAction( this.siteKey, name, ids, null, params );

		this.dispatch( requestedAction( this.siteKey, name, ids ) );
		this.dispatch( requestAction );
	};

	parseApiParams( paramsWithPlaceholders, placeholderData ) {
		const parsedParams = Object.keys( paramsWithPlaceholders ).reduce( ( params, key ) => {
			const placeholder = paramsWithPlaceholders[ key ];
			const data = placeholderData[ placeholder ];
			if ( data ) {
				params[ key ] = placeholderData[ placeholder ];
			} else {
				debug( 'Missing data for parameter placeholder "' + placeholder + '"' );
			}
			return params;
		}, {} );
		return parsedParams;
	}

	setNextUpdate = milliseconds => {
		if ( this.timeoutId ) {
			clearTimeout( this.timeoutId );
		}

		if ( milliseconds ) {
			const delay = Math.max( milliseconds, MIN_UPDATE_DELAY );
			debug( 'Setting next update in ' + delay / 1000 + 's' );
			this.timeoutId = setTimeout( this.updateRequirements, delay );
		}
	};

	checkDataRequirements = ( now = new Date() ) => {
		const updates = {};
		let nextUpdate = Number.MAX_SAFE_INTEGER;

		Object.keys( this.dataRequirements ).forEach( endpointName => {
			const {
				updates: endpointUpdates,
				nextUpdate: nextEndpointUpdate,
			} = this.checkEndpointRequirements(
				endpointName,
				this.dataRequirements[ endpointName ],
				now
			);

			if ( endpointUpdates.length ) {
				updates[ endpointName ] = endpointUpdates;
			}
			nextUpdate = Math.min( nextUpdate, nextEndpointUpdate );
		} );

		return {
			nextUpdate,
			updates,
		};
	};

	checkEndpointRequirements = ( endpointName, endpointRequirements, now = new Date() ) => {
		const updates = [];
		let nextUpdate = Number.MAX_SAFE_INTEGER;

		Object.keys( endpointRequirements ).forEach( id => {
			const nextItemUpdate = this.getNextItemUpdate(
				endpointName,
				id,
				endpointRequirements[ id ],
				now
			);

			if ( 0 >= nextItemUpdate ) {
				updates.push( id );
			}
			nextUpdate = Math.min( nextUpdate, nextItemUpdate );
		} );

		return {
			nextUpdate,
			updates,
		};
	};

	getNextItemUpdate = ( endpointName, id, itemRequirements, now = new Date() ) => {
		const itemState = get( this.siteState, [ endpointName, id ] ) || {};
		const freshnessExpiration = getFreshnessExpiration( itemRequirements, itemState, now );
		const timeoutExpiration = getTimeoutExpiration( itemRequirements, itemState, now );

		if ( 0 >= timeoutExpiration ) {
			debug( endpointName + ':' + id + ' - timeout reached' );
		} else if ( 0 >= freshnessExpiration ) {
			debug( endpointName + ':' + id + ' - stale' );
		}

		return Math.min( freshnessExpiration, timeoutExpiration );
	};
}

// TODO: Unit test this.
function getFreshnessExpiration( itemRequirements, itemState, now = new Date() ) {
	const freshness = getRequirement( 'freshness', itemRequirements );

	if ( freshness ) {
		const lastReceived = itemState.lastReceived || Number.MIN_SAFE_INTEGER;
		const lastRequested = itemState.lastRequested || Number.MIN_SAFE_INTEGER;
		const lastAction = lastReceived > lastRequested ? lastReceived : lastRequested;
		const age = now - lastAction;
		return freshness - age;
	}
	return Number.MAX_SAFE_INTEGER;
}

// TODO: Unit test this.
function getTimeoutExpiration( itemRequirements, itemState, now = new Date() ) {
	const timeout = getRequirement( 'timeout', itemRequirements );

	if ( timeout ) {
		const lastReceived = itemState.lastReceived || Number.MIN_SAFE_INTEGER;
		const lastRequested = itemState.lastRequested || Number.MIN_SAFE_INTEGER;
		const requesting = lastRequested > lastReceived;
		const sinceRequest = now - lastRequested;
		return requesting ? timeout - sinceRequest : Number.MAX_SAFE_INTEGER;
	}
	return Number.MAX_SAFE_INTEGER;
}

// TODO: Unit test this.
function getRequirement( name, requirements, defaults = DEFAULT_REQUIREMENTS ) {
	return requirements.hasOwnProperty( name ) ? requirements[ name ] : defaults[ name ];
}

// TODO: Unit test this.
function reduceRequirements( oldRequirements, newRequirements ) {
	const oldFreshness = oldRequirements.freshness || Number.MAX_SAFE_INTEGER;
	const newFreshness = newRequirements.freshness || Number.MAX_SAFE_INTEGER;

	return newFreshness < oldFreshness ? newRequirements : oldRequirements;
}

function mapSelectorsToSiteState( selectors, siteState, requireData ) {
	return Object.keys( selectors ).reduce( ( mappedSelectors, selectorName ) => {
		mappedSelectors[ selectorName ] = selectors[ selectorName ]( siteState, requireData );
		return mappedSelectors;
	}, {} );
}
