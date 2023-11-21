import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';

const useAddTagsToPost = ( postId, tags ) => {
	const [ tagsAddedToPost, setTagsAddedToPost ] = useState( false );
	function saveTags() {
		apiFetch( {
			method: 'POST',
			path: `/wpcom/v2/read/sites/${ window._currentSiteId }/posts/${ postId }/tags/add`,
			data: { tags },
		} ).finally( () => {
			setTagsAddedToPost( true );
		} );
	}
	return { tagsAddedToPost, setTagsAddedToPost, saveTags };
};

export default useAddTagsToPost;
