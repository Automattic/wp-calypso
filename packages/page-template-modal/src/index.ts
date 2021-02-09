/**
 * External dependencies
 */
import { stubTrue } from 'lodash';
import '@wordpress/nux';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import PageTemplateModal from './components/page-template-modal';
import './styles/starter-page-templates-editor.scss';

const INSERTING_HOOK_NAME = 'isInsertingPageTemplate';
const INSERTING_HOOK_NAMESPACE = 'automattic/full-site-editing/inserting-template';

export { initializeWithIdentity as initializeTracksWithIdentity } from './utils/tracking';

export const PageTemplatesPlugin = compose(
	withSelect( ( select ) => {
		const getMeta = () => select( 'core/editor' ).getEditedPostAttribute( 'meta' );
		const { _starter_page_template } = getMeta();
		const { isOpen } = select( 'automattic/starter-page-layouts' );
		const currentBlocks = select( 'core/editor' ).getBlocks();
		return {
			isOpen: isOpen(),
			getMeta,
			_starter_page_template,
			currentBlocks,
			currentPostTitle: select( 'core/editor' ).getCurrentPost().title,
			postContentBlock: currentBlocks.find( ( block ) => block.name === 'a8c/post-content' ),
			isWelcomeGuideActive: select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' ), // Gutenberg 7.2.0 or higher
			areTipsEnabled: select( 'core/nux' ) ? select( 'core/nux' ).areTipsEnabled() : false, // Gutenberg 7.1.0 or lower
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const editorDispatcher = dispatch( 'core/editor' );
		const { setOpenState } = dispatch( 'automattic/starter-page-layouts' );
		return {
			setOpenState,
			saveTemplateChoice: ( name ) => {
				// Save selected template slug in meta.
				const currentMeta = ownProps.getMeta();
				editorDispatcher.editPost( {
					meta: {
						...currentMeta,
						_starter_page_template: name,
					},
				} );
			},
			insertTemplate: ( title, blocks ) => {
				// Add filter to let the tracking library know we are inserting a template.
				addFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE, stubTrue );

				// Set post title.
				if ( title ) {
					editorDispatcher.editPost( { title } );
				}

				// Replace blocks.
				const postContentBlock = ownProps.postContentBlock;
				dispatch( 'core/block-editor' ).replaceInnerBlocks(
					postContentBlock ? postContentBlock.clientId : '',
					blocks,
					false
				);

				// Remove filter.
				removeFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE );
			},
			hideWelcomeGuide: () => {
				if ( ownProps.isWelcomeGuideActive ) {
					// Gutenberg 7.2.0 or higher.
					dispatch( 'core/edit-post' ).toggleFeature( 'welcomeGuide' );
				} else if ( ownProps.areTipsEnabled ) {
					// Gutenberg 7.1.0 or lower.
					dispatch( 'core/nux' ).disableTips();
				}
			},
		};
	} )
)( PageTemplateModal );
