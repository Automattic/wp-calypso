import { useCallback, useEffect, useState } from '@wordpress/element';

export const useHelpCenterArticleTabComponent = ( postContent: string | undefined ) => {
	const [ tabHash, setTabHash ] = useState( '' );

	const toggleTab = ( element: Element, show: boolean ) => {
		( element as HTMLElement ).style.display = show ? 'block' : 'none';
		element.setAttribute( 'aria-hidden', show ? 'false' : 'true' );
	};

	const toggleTabTitle = ( element: Element, show: boolean ) => {
		element.setAttribute( 'aria-selected', show ? 'true' : 'false' );
	};

	const activateTab = useCallback( () => {
		const hash = tabHash;

		const tabs = Array.from( document.querySelectorAll( '.wp-block-wpsupport3-tabs' ) );

		tabs.forEach( ( tab ) => {
			const titles = Array.from( tab.querySelectorAll( '.wpsupport3-tab__title' ) );
			const bodies = Array.from(
				tab.querySelectorAll( '.wp-block-wpsupport3-tab:not(.invisible_tabpanel)' )
			);

			const match = titles.findIndex( ( titles ) => titles.id === hash?.substring( 1 ) );

			// Reset selection
			titles.forEach( ( title ) => toggleTabTitle( title, false ) );
			bodies.forEach( ( body ) => toggleTab( body, false ) );

			if ( hash && match !== -1 ) {
				toggleTabTitle( titles[ match ], true );
				toggleTab( bodies[ match ], true );
			} else {
				// If the first tab is invisible from the editor, we set the first tab as active.
				toggleTabTitle( titles[ 0 ], true );
				toggleTab( bodies[ 0 ], true );
			}
		} );
	}, [ tabHash ] );

	useEffect( () => {
		if ( tabHash || postContent ) {
			activateTab();
		}
	}, [ activateTab, tabHash, postContent ] );

	useEffect( () => {
		if ( postContent ) {
			const titles = Array.from(
				document.querySelectorAll( '.wp-block-wpsupport3-tabs .wpsupport3-tab__title' )
			);
			titles.forEach( ( title ) => {
				title.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					setTabHash( `#${ title?.id }` );
					setTimeout( () => {
						window.scroll( 0, document.documentElement.scrollTop );
					} );
				} );
			} );
		}
	}, [ postContent ] );
};
