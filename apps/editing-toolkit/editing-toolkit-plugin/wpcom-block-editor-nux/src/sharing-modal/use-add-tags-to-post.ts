import apiFetch from '@wordpress/api-fetch';

type HasAddedTagsResult = {
	added_tags: number;
	success: boolean;
};

// OnSaveTags is a function callback that takes the number of tags added
// to the post as an argument.
type OnSaveTagsCallback = ( addedTags: number ) => void;
const useAddTagsToPost = ( postId: number, tags: string[], onSaveTags: OnSaveTagsCallback ) => {
	async function saveTags() {
		try {
			const result: HasAddedTagsResult = await apiFetch( {
				method: 'POST',
				path: `/wpcom/v2/read/sites/${ window._currentSiteId }/posts/${ postId }/tags/add`,
				data: { tags },
			} );
			onSaveTags( result.added_tags ?? 0 );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error: Unable to add tags. Reason: %s', error );
		}
	}
	return { saveTags };
};

export default useAddTagsToPost;
