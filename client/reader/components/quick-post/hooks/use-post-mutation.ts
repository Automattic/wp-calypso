import { mutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface PostItem {
	ID: number;
	site_ID: number;
	title: string;
	content: string;
	URL: string;
}

interface PostMutationVariables {
	postContent: string;
	status: 'draft' | 'publish';
	siteId: number | undefined;
}

const request = async ( { postContent, status, siteId }: PostMutationVariables ) => {
	if ( ! siteId ) {
		return Promise.reject( new Error( 'Site ID is required' ) );
	}
	return wpcom.site( siteId ).post().add( {
		content: postContent,
		status: status,
	} );
};

export const savePostMutation = ( { siteId }: { siteId?: number } ) => {
	return mutationOptions< PostItem, Error, PostMutationVariables >( {
		mutationKey: [ 'save-post', siteId ],
		mutationFn: ( { postContent, status } ) => request( { postContent, status, siteId } ),
	} );
};
