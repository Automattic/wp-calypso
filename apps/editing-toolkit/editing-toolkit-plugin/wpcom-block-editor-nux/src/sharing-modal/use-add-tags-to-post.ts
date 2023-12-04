import apiFetch from '@wordpress/api-fetch';

type HasAddedTagsResult = {
	added_tags: number;
	success: boolean;
};

type OnSaveTagsCallback = ( addedTags: number ) => void;
const useAddTagsToPost = ( postId: number, tags: string[], onSaveTags: OnSaveTagsCallback ) => {
	async function saveTags() {
		let addedTags = 0;
		try {
			const result: HasAddedTagsResult = await apiFetch( {
				method: 'POST',
				path: `/wpcom/v2/read/sites/${ window._currentSiteId }/posts/${ postId }/tags/add`,
				data: { tags },
			} );
			addedTags = result.added_tags ?? 0;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Error: Unable to add tags. Reason: %s', JSON.stringify( error ) );
		}
		onSaveTags( addedTags );
	}
	return { saveTags };
};

export default useAddTagsToPost;
