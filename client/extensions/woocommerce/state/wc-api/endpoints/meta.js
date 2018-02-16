/** @format */

let allMeta = {};

export const clearMeta = metaMap => key => {
	// eslint-disable-next-line no-unused-vars
	const { [ key ]: removedMeta, ...remainingMeta } = metaMap;
	return remainingMeta;
};

export const setMeta = metaMap => ( key, meta ) => {
	const oldMeta = metaMap[ key ];
	const newMeta = { ...oldMeta, ...meta };
	const newMetaMap = { ...metaMap, [ key ]: newMeta };
	return newMetaMap;
};

export const setLastDataReceived = metaMap => ( key, time = new Date() ) => {
	return setMeta( metaMap )( key, { lastData: time, lastRequest: null } );
};

export const setRequirements = metaMap => ( key, requirements, fetchAction, time = new Date() ) => {
	return setMeta( metaMap )( key, { lastRender: time, requirements, fetchAction } );
};

export default {
	getMetaMap: () => allMeta,
	clearMeta: key => {
		allMeta = clearMeta( allMeta )( key );
	},
	setMeta: ( key, meta ) => {
		allMeta = setMeta( allMeta )( key, meta );
	},
	setLastDataReceived: ( key, time ) => {
		allMeta = setLastDataReceived( allMeta )( key, time );
	},
	setRequirements: ( key, requirements, time ) => {
		allMeta = setRequirements( allMeta )( key, requirements, time );
	},
};
