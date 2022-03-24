import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

const useHasSeenSellerCelebrationModal = () => {
	const [ hasSeenSellerCelebrationModal, setHasSeenSellerCelebrationModal ] = useState( '' );

	useEffect( () => {
		fetchHasSeenSellerCelebrationModal();
	} );

	function fetchHasSeenSellerCelebrationModal() {
		apiFetch( { path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal' } )
			.then( ( result ) =>
				setHasSeenSellerCelebrationModal( result.has_seen_seller_celebration_modal )
			)
			.catch( () => setHasSeenSellerCelebrationModal( false ) );
	}

	function updateHasSeenSellerCelebrationModal( value ) {
		apiFetch( {
			method: 'PUT',
			path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal',
			data: { has_seen_seller_celebration_modal: value },
		} ).finally( () => {
			setHasSeenSellerCelebrationModal( value );
		} );
	}

	return { hasSeenSellerCelebrationModal, updateHasSeenSellerCelebrationModal };
};
export default useHasSeenSellerCelebrationModal;
