import type { Subject } from '../../types';

export const getDisplayUrl = ( url?: string, withPath = false ) => {
	try {
		const { hostname, pathname } = new URL( url ?? '' );
		return withPath ? ( hostname + pathname ).replace( /\/$/, '' ) : hostname;
	} catch {
		return undefined;
	}
};

export const getRangeText = ( block?: Subject, type?: string ) => {
	const range = block?.ranges?.find( ( candidate ) => candidate.type === type );
	return range ? block?.text.slice( ...range.indices ).trim() : undefined;
};
