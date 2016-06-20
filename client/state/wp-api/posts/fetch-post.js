import wpcom from 'lib/wp';

import { receivePost } from 'state/posts/actions';

const savePost = dispatch => post => dispatch( receivePost( post ) );
const failPost = error => console.log( error );

export const fetchPost = ( { dispatch }, { siteId, postId } ) => {
	wpcom
		.site( siteId )
		.post( postId )
		.get()
		.then( savePost( dispatch ) )
		.catch( failPost );
};
