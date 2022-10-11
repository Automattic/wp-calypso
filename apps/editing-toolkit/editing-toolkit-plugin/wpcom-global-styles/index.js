/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesModal from './modal';
import GlobalStylesNotice from './notice';
import './store';

const showGlobalStylesModal = () => {
	registerPlugin( 'wpcom-global-styles', {
		render: () => <GlobalStylesModal />,
	} );
};

const showGlobalStylesNotice = async () => {
	const globalStylesConfig = select( 'core' ).getEntityConfig( 'root', 'globalStyles' );
	if ( ! globalStylesConfig ) {
		return;
	}

	const getEditorActions = async () =>
		new Promise( ( resolve ) => {
			const unsubscribe = subscribe( () => {
				const editorActions = document.querySelector(
					'.interface-interface-skeleton .interface-interface-skeleton__actions'
				);

				if ( editorActions ) {
					unsubscribe();
					resolve( editorActions );
				}
			} );
		} );
	const editorActions = await getEditorActions();

	const entitiesPreSavePanelObserver = new window.MutationObserver( ( mutations ) => {
		const isEntitiesPreSavePanel = ( node ) =>
			node.classList.contains( 'entities-saved-states__panel' );

		for ( const record of mutations ) {
			for ( const node of record.addedNodes ) {
				if ( ! isEntitiesPreSavePanel( node ) ) {
					continue;
				}

				const noticeContainer = document.createElement( 'div' );
				const entitiesTitles = node.querySelectorAll( '.components-panel__body-title' );
				for ( const entityTitle of entitiesTitles ) {
					if ( entityTitle.textContent !== globalStylesConfig.label ) {
						continue;
					}

					entityTitle.parentElement.append( noticeContainer );
					break;
				}

				render( <GlobalStylesNotice />, noticeContainer );
				return;
			}
		}
	} );
	entitiesPreSavePanelObserver.observe( editorActions, { childList: true } );
};

domReady( () => {
	showGlobalStylesModal();
	showGlobalStylesNotice();
} );
