import wpcom from 'lib/wp';

import {
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
} from 'state/action-types';

export const requestPostCounts = ( { dispatch } ) => ( { siteId, postType } ) => (
	wpcom
		.undocumented()
		.site( siteId )
		.postCounts( { type: postType } )
		.then( ( { counts } ) => {
			dispatch( {
				type: POST_COUNTS_RECEIVE,
				siteId,
				postType,
				counts,
			} );
			dispatch( {
				type: POST_COUNTS_REQUEST_SUCCESS,
				siteId,
				postType,
			} );
		} )
		.catch( error => dispatch( {
			type: POST_COUNTS_REQUEST_FAILURE,
			siteId,
			postType,
			error,
		} ) )
);

export default [ POST_COUNTS_REQUEST, requestPostCounts ];
