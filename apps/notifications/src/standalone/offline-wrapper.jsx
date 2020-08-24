import React from 'react';
import { response } from './offline-notes';

const wpcom = {
	fetchNote: ( id, query, cb ) => cb( null, response.notes[ id ] ),
	fetchSuggestions: ( query, cb ) => cb( [] ),
	listNotes: ( query, cb ) => db( null, response.notes ),
	markReadStatus: () => cb( null ),
	pinghub: {
		connect: () => {},
	},
	req: {
		get: ( params, query, cb ) => {
			if ( '/notifications/' === params.path ) {
				setTimeout( () => cb( null, response ), 2000 );
			}
		},
		post: () => {},
	},
	subscribeToNoteStream: () => cb( true ),
	site: () => ( {
		comment: () => {
			like: () => {};
		},
		post: () => {},
	} ),
};

export const OfflineWrapper = ( Component ) => ( { clientId, redirectPath, ...props } ) => (
	<Component { ...props } { ...{ wpcom } } />
);

export default OfflineWrapper;
