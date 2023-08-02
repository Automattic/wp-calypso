import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import * as React from 'react';
import { useContext } from 'react';

type HasSeenSCModalResult = {
	has_seen_seller_celebration_modal: boolean;
};

type HasSeenSellerCelebrationModalContextType = {
	hasSeenSellerCelebrationModal: boolean;
	updateHasSeenSellerCelebrationModal: ( value: boolean ) => void;
};

const HasSeenSCModalContext = React.createContext< HasSeenSellerCelebrationModalContextType >( {
	hasSeenSellerCelebrationModal: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	updateHasSeenSellerCelebrationModal: () => {},
} );

export const useHasSeenSellerCelebrationModal = () => {
	return useContext( HasSeenSCModalContext );
};

export const HasSeenSellerCelebrationModalProvider: React.FC< { children: JSX.Element } > =
	function ( { children } ) {
		const [ hasSeenSellerCelebrationModal, setHasSeenSellerCelebrationModal ] = useState( false );

		function fetchHasSeenSellerCelebrationModal() {
			apiFetch< HasSeenSCModalResult >( {
				path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal',
			} )
				.then( ( result: HasSeenSCModalResult ) =>
					setHasSeenSellerCelebrationModal( result.has_seen_seller_celebration_modal )
				)
				.catch( () => setHasSeenSellerCelebrationModal( false ) );
		}

		function updateHasSeenSellerCelebrationModal( value: boolean ) {
			apiFetch( {
				method: 'PUT',
				path: '/wpcom/v2/block-editor/has-seen-seller-celebration-modal',
				data: { has_seen_seller_celebration_modal: value },
			} ).finally( () => {
				setHasSeenSellerCelebrationModal( true );
			} );
		}

		useEffect( () => {
			fetchHasSeenSellerCelebrationModal();
		}, [] );

		return (
			<HasSeenSCModalContext.Provider
				value={ { hasSeenSellerCelebrationModal, updateHasSeenSellerCelebrationModal } }
			>
				{ children }
			</HasSeenSCModalContext.Provider>
		);
	};
