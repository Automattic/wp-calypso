import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';

const useShouldShowSellerCelebrationModal = () => {
	const [ shouldShowSellerCelebrationModal, setShouldShowSellerCelebrationModal ] = useState( '' );

	useEffect( () => {
		fetchShouldShowSellerCelebrationModal();
	} );

	function fetchShouldShowSellerCelebrationModal() {
		apiFetch( { path: '/wpcom/v2/block-editor/should-show-seller-celebration-modal' } )
			.then( ( result ) =>
				setShouldShowSellerCelebrationModal( result.should_show_seller_celebration_modal )
			)
			.catch( () => setShouldShowSellerCelebrationModal( false ) );
	}

	return shouldShowSellerCelebrationModal;
};
export default useShouldShowSellerCelebrationModal;
