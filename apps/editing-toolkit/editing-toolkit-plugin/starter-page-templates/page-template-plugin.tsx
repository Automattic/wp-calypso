/**
 * External dependencies
 */
import '@wordpress/nux';
import { useSelect, useDispatch } from '@wordpress/data';
import { addFilter, removeFilter } from '@wordpress/hooks';
import { LayoutDefinition, PageTemplateModal } from '@automattic/page-template-modal';
import React, { useCallback } from '@wordpress/element';

const INSERTING_HOOK_NAME = 'isInsertingPageTemplate';
const INSERTING_HOOK_NAMESPACE = 'automattic/full-site-editing/inserting-template';

interface PageTemplatesPluginProps {
	templates: LayoutDefinition[];
	locale?: string;
	theme?: string;
}

export function PageTemplatesPlugin( props: PageTemplatesPluginProps ): JSX.Element {
	const { setOpenState } = useDispatch( 'automattic/starter-page-layouts' );
	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const { editPost } = useDispatch( 'core/editor' );
	const { toggleFeature } = useDispatch( 'core/edit-post' );
	const { disableTips } = useDispatch( 'core/nux' );

	const selectProps = useSelect( ( select ) => {
		const { isOpen } = select( 'automattic/starter-page-layouts' );
		return {
			isOpen: isOpen(),
			isWelcomeGuideActive: select( 'core/edit-post' ).isFeatureActive( 'welcomeGuide' ) as boolean, // Gutenberg 7.2.0 or higher
			areTipsEnabled: select( 'core/nux' )
				? ( select( 'core/nux' ).areTipsEnabled() as boolean )
				: false, // Gutenberg 7.1.0 or lower
		};
	} );

	const { getMeta, postContentBlock } = useSelect( ( select ) => {
		const getMeta = () => select( 'core/editor' ).getEditedPostAttribute( 'meta' );
		const currentBlocks = select( 'core/editor' ).getBlocks();
		return {
			getMeta,
			postContentBlock: currentBlocks.find( ( block ) => block.name === 'a8c/post-content' ),
		};
	} );

	const saveTemplateChoice = useCallback(
		( name: string ) => {
			// Save selected template slug in meta.
			const currentMeta = getMeta();
			editPost( {
				meta: {
					...currentMeta,
					_starter_page_template: name,
				},
			} );
		},
		[ editPost, getMeta ]
	);

	const insertTemplate = useCallback(
		( title, blocks ) => {
			// Add filter to let the tracking library know we are inserting a template.
			addFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE, () => true );

			// Set post title.
			if ( title ) {
				editPost( { title } );
			}

			// Replace blocks.
			replaceInnerBlocks( postContentBlock ? postContentBlock.clientId : '', blocks, false );

			// Remove filter.
			removeFilter( INSERTING_HOOK_NAME, INSERTING_HOOK_NAMESPACE );
		},
		[ editPost, postContentBlock, replaceInnerBlocks ]
	);

	const { isWelcomeGuideActive, areTipsEnabled } = selectProps;

	const hideWelcomeGuide = useCallback( () => {
		if ( isWelcomeGuideActive ) {
			// Gutenberg 7.2.0 or higher.
			toggleFeature( 'welcomeGuide' );
		} else if ( areTipsEnabled ) {
			// Gutenberg 7.1.0 or lower.
			disableTips();
		}
	}, [ areTipsEnabled, disableTips, isWelcomeGuideActive, toggleFeature ] );

	return (
		<PageTemplateModal
			{ ...selectProps }
			setOpenState={ setOpenState }
			saveTemplateChoice={ saveTemplateChoice }
			insertTemplate={ insertTemplate }
			hideWelcomeGuide={ hideWelcomeGuide }
			{ ...props }
		/>
	);
}
