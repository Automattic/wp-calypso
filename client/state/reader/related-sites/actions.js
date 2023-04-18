import {
	READER_RELATED_SITES_REQUEST,
	READER_RELATED_SITES_RECEIVE,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/related/sites';

import 'calypso/state/reader/init';

export const requestRelatedSites = ( { offset = 0, number = 4, tag = '' } ) => ( {
	type: READER_RELATED_SITES_REQUEST,
	payload: { offset, number, tag },
} );

export const receiveRelatedSites = ( { tag, sites, offset = 0 } ) => ( {
	type: READER_RELATED_SITES_RECEIVE,
	payload: { sites, offset },
	tag,
} );
