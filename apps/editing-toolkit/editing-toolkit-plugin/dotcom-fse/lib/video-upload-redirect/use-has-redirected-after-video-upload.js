import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

const useHasRedirectedAfterVideoUpload = () => {
	const [ hasRedirectedAfterVideoUpload, setHasRedirectedAfterVideoUpload ] = useState( '' );

	useEffect( () => {
		fetchHasRedirectedAfterVideoUpload();
	}, [] );

	function fetchHasRedirectedAfterVideoUpload() {
		apiFetch( { path: '/wpcom/v2/block-editor/has-redirected-after-video-upload' } )
			.then( ( result ) =>
				setHasRedirectedAfterVideoUpload( result.has_redirected_after_video_upload )
			)
			.catch( () => setHasRedirectedAfterVideoUpload( false ) );
	}

	function updateHasRedirectedAfterVideoUpload( value ) {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/has-redirected-after-video-upload',
			data: { has_redirected_after_video_upload: value },
		} ).finally( () => {
			setHasRedirectedAfterVideoUpload( value );
		} );
	}

	return { hasRedirectedAfterVideoUpload, updateHasRedirectedAfterVideoUpload };
};
export default useHasRedirectedAfterVideoUpload;
