/**
 * External Dependencies
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import domReady from '@wordpress/dom-ready';
import { PostPreviewButton, PostPublishButton, PostSavedState } from '@wordpress/editor';
import { Button, Dropdown } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
/**
 * Internal Dependencies
 */

import './styles.scss';

const PostEditorButtonMenu: React.FunctionComponent = () => {
	const editPostStore = 'core/edit-post';

	const { hasActiveMetaboxes, isPublishSidebarOpened, isSaving } = useSelect(
		( select ) => ( {
			hasActiveMetaboxes: select( editPostStore ).hasMetaBoxes(),
			isPublishSidebarOpened: select( editPostStore ).isPublishSidebarOpened(),
			isSaving: select( editPostStore ).isSavingMetaBoxes(),
			showIconLabels: select( editPostStore ).isFeatureActive( 'showIconLabels' ),
			hasReducedUI: select( editPostStore ).isFeatureActive( 'reducedUI' ),
			isEditingTemplate: select( editPostStore ).isEditingTemplate(),
		} ),
		[]
	);

	// These buttons may require props that exist for their usages in Gutenberg here; gutenberg-repo/packages/edit-post/src/components/header/index.js
	return (
		<div className="dropdown-container">
			<Dropdown
				className="my-container-class-name"
				contentClassName="my-popover-content-classname"
				position="bottom center"
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button isPrimary onClick={ onToggle } aria-expanded={ isOpen }>
						Update
					</Button>
				) }
				renderContent={ () => (
					<div className="dropdown-content">
						{ ! isPublishSidebarOpened && (
							// This button isn't completely hidden by the publish sidebar.
							// We can't hide the whole toolbar when the publish sidebar is open because
							// we want to prevent mounting/unmounting the PostPublishButtonOrToggle DOM node.
							// We track that DOM node to return focus to the PostPublishButtonOrToggle
							// when the publish sidebar has been closed.
							<PostSavedState forceIsDirty={ hasActiveMetaboxes } forceIsSaving={ isSaving } />
						) }
						<PostPreviewButton forceIsAutosaveable={ hasActiveMetaboxes } />
						<PostPublishButton />
					</div>
				) }
			/>
		</div>
	);
};

domReady( () => {
	const editorHeaderButtonsInception = setInterval( () => {
		// Cycle through interval until header toolbar is found.
		const toolbar = document.querySelector( '.edit-post-header__settings' );

		if ( ! toolbar ) {
			return;
		}
		clearInterval( editorHeaderButtonsInception );

		// Add components toolbar with override class name (original will be hidden in ./style.scss).
		const componentsToolbar = document.createElement( 'div' );
		componentsToolbar.className = 'editor-header-buttons';
		toolbar.prepend( componentsToolbar );

		ReactDOM.render( <PostEditorButtonMenu />, componentsToolbar );
	} );
} );
