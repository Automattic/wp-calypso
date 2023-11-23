import apiFetch from '@wordpress/api-fetch';

type HasAddedTagsResult = {
	added_tags: number;
	success: boolean;
};

const useAddTagsToPost = ( postId, tags, onSaveTags ) => {
	function saveTags() {
		apiFetch( {
			method: 'POST',
			path: `/wpcom/v2/read/sites/${ window._currentSiteId }/posts/${ postId }/tags/add`,
			data: { tags },
		} ).then( ( result: HasAddedTagsResult ) => {
			onSaveTags( result.added_tags );
		} );
	}
	return { saveTags };
};

export default useAddTagsToPost;
