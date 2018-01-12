/** @format */
/**
 * External dependencies
 */
/* eslint-disable */

import { isEqual, pickBy, forEach, cloneDeep } from 'lodash';

const wastedRenders = {};
window.wastedRenders = wastedRenders;

const WASTED_COUNT = 'wastedRenderCount';
const BAD_PROPS = 'bad_props';

const getDisplayName = o => o.displayName || o.constructor.displayName || o.constructor.name;

function measuredComponentDidUpdate( nextProps ) {
	const displayName = getDisplayName( this );
	wastedRenders[ displayName ] = wastedRenders[ displayName ] || {
		[ WASTED_COUNT ]: 0,
		[ BAD_PROPS ]: {},
	};

	const stats = wastedRenders[ displayName ];
	const badProps = stats[ BAD_PROPS ];
	let hasWaste = false;

	const keys = Object.keys( nextProps );
	keys.forEach( key => {
		const deepEqual = isEqual( this.props[ key ], nextProps[ key ] );
		const shallowEqual = this.props[ key ] === nextProps[ key ];
		if ( ! shallowEqual && deepEqual ) {
			badProps[ key ] = ( badProps[ key ] || 0 ) + 1;
			hasWaste = true;
		}
	} );

	if ( hasWaste ) {
		stats[ WASTED_COUNT ] += 1;
	}
}

function measureComponents( React ) {
	React.Component.prototype.componentDidUpdate = measuredComponentDidUpdate;
}

function prettyPrintWasted() {
	const offenders = cloneDeep(
		pickBy( wastedRenders, component => component.wastedRenderCount > 10 )
	);
	Object.values( offenders ).forEach( component => {
		component[ BAD_PROPS ] = JSON.stringify( component[ BAD_PROPS ] );
	} );
	console.table( offenders );
}

window.prettyPrintWasted = prettyPrintWasted;

export default measureComponents;
