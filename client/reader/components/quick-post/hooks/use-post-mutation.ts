import { mutationOptions } from '@tanstack/react-query';
import { stripHTML } from 'calypso/lib/formatting';
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
	return (
		wpcom
			.site( siteId )
			.post()
			//TODO: Revisit this title generation
			.add( {
				title:
					(
						stripHTML( postContent )
							.split( '\n' )
							.find( ( line: string ) => line.trim() ) || ''
					)
						.substring( 0, 57 )
						.trim() + '...',
				content: postContent,
				status: status,
			} )
	);
};

export const savePostMutation = ( { siteId }: { siteId?: number } ) => {
	return mutationOptions< PostItem, Error, PostMutationVariables >( {
		mutationKey: [ 'save-post', siteId ],
		mutationFn: ( { postContent, status } ) => request( { postContent, status, siteId } ),
	} );
};
