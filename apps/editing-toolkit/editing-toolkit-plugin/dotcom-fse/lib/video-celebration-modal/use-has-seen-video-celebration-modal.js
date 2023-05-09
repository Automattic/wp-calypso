import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

const useHasSeenVideoCelbrationModal = () => {
	const [ hasSeenVideoCelebrationModal, setHasSeenVideoCelebrationModal ] = useState( '' );

	useEffect( () => {
		fetchHasSeenVideoCelebrationModal();
	}, [] );

	function fetchHasSeenVideoCelebrationModal() {
		apiFetch( { path: '/wpcom/v2/block-editor/has-seen-video-celebration-modal' } )
			.then( ( result ) =>
				setHasSeenVideoCelebrationModal( result.has_seen_video_celebration_modal )
			)
			.catch( () => setHasSeenVideoCelebrationModal( false ) );
	}

	function updateHasSeenVideoCelebrationModal( value ) {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/has-seen-video-celebration-modal',
			data: { has_seen_video_celebration_modal: value },
		} ).finally( () => {
			setHasSeenVideoCelebrationModal( value );
		} );
	}

	return { hasSeenVideoCelebrationModal, updateHasSeenVideoCelebrationModal };
};
export default useHasSeenVideoCelbrationModal;
