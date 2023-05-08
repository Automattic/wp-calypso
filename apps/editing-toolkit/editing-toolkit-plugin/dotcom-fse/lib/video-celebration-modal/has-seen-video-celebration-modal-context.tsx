import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import * as React from 'react';
import { useContext } from 'react';

type HasSeenVCModalResult = {
	has_seen_video_celebration_modal: boolean;
};

type HasSeenVideoCelebrationModalContextType = {
	hasSeenVideoCelebrationModal: boolean;
	updateHasSeenVideoCelebrationModal: ( value: boolean ) => void;
};

const HasSeenVCModalContext = React.createContext< HasSeenVideoCelebrationModalContextType >( {
	hasSeenVideoCelebrationModal: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	updateHasSeenVideoCelebrationModal: () => {},
} );

export const useHasSeenVideoCelebrationModal = () => {
	return useContext( HasSeenVCModalContext );
};

export const HasSeenVideoCelebrationModalProvider: React.FC< { children: JSX.Element } > =
	function ( { children } ) {
		const [ hasSeenVideoCelebrationModal, setHasSeenVideoCelebrationModal ] = useState( false );

		useEffect( () => {
			fetchHasSeenVideoCelebrationModal();
		}, [] );

		function fetchHasSeenVideoCelebrationModal() {
			apiFetch< HasSeenVCModalResult >( {
				path: '/wpcom/v2/block-editor/has-seen-video-celebration-modal',
			} )
				.then( ( result: HasSeenVCModalResult ) =>
					setHasSeenVideoCelebrationModal( result.has_seen_video_celebration_modal )
				)
				.catch( () => setHasSeenVideoCelebrationModal( false ) );
		}

		function updateHasSeenVideoCelebrationModal( value: boolean ) {
			apiFetch( {
				method: 'PUT',
				path: '/wpcom/v2/block-editor/has-seen-video-celebration-modal',
				data: { has_seen_video_celebration_modal: value },
			} ).finally( () => {
				setHasSeenVideoCelebrationModal( value );
			} );
		}

		return (
			<HasSeenVCModalContext.Provider
				value={ { hasSeenVideoCelebrationModal, updateHasSeenVideoCelebrationModal } }
			>
				{ children }
			</HasSeenVCModalContext.Provider>
		);
	};
