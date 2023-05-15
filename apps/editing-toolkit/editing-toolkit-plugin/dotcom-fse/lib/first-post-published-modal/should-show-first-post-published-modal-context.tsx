import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import * as React from 'react';
import { useContext } from 'react';
import { selectors as wpcomWelcomeGuideSelectors } from '../../../wpcom-block-editor-nux/src/store';
import type { SelectFromMap } from '@automattic/data-stores';

type WpcomWelcomeGuideSelectors = SelectFromMap< typeof wpcomWelcomeGuideSelectors >;

const ShouldShowFPPModalContext = React.createContext< boolean >( false );

export const useShouldShowFirstPostPublishedModal = () => {
	return useContext( ShouldShowFPPModalContext );
};

export const ShouldShowFirstPostPublishedModalProvider: React.FC< { children: JSX.Element } > =
	function ( { children } ) {
		const { fetchShouldShowFirstPostPublishedModal } = useDispatch(
			'automattic/wpcom-welcome-guide'
		);

		useEffect( () => {
			fetchShouldShowFirstPostPublishedModal();
		}, [ fetchShouldShowFirstPostPublishedModal ] );

		const ShouldShowFirstPostPublishedModal = useSelect(
			( select ) =>
				(
					select( 'automattic/wpcom-welcome-guide' ) as WpcomWelcomeGuideSelectors
				 ).getShouldShowFirstPostPublishedModal(),
			[]
		);
		return (
			<ShouldShowFPPModalContext.Provider value={ ShouldShowFirstPostPublishedModal }>
				{ children }
			</ShouldShowFPPModalContext.Provider>
		);
	};
