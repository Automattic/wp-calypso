import { PagePatternModal, PatternDefinition } from '@automattic/page-pattern-modal';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { addFilter, removeFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { pageLayoutStore } from './store';
import '@wordpress/nux';

const INSERTING_HOOK_NAME = 'isInsertingPagePattern';
const INSERTING_HOOK_NAMESPACE = 'automattic/full-site-editing/inserting-pattern';

interface PagePatternsPluginProps {
	patterns: PatternDefinition[];
}
type CoreEditorPlaceholder = {
	getBlocks: ( ...args: unknown[] ) => Array< { name: string; clientId: string } >;
	getEditedPostAttribute: ( ...args: unknown[] ) => unknown;
};
type CoreEditPostPlaceholder = {
	isFeatureActive: ( ...args: unknown[] ) => boolean;
};
type CoreNuxPlaceholder = {
	areTipsEnabled: ( ...args: unknown[] ) => boolean;
};

export function PagePatternsPlugin( props: PagePatternsPluginProps ) {
	const { setOpenState } = useDispatch( pageLayoutStore );
	const { setUsedPageOrPatternsModal } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
	const { editPost } = useDispatch( 'core/editor' );
	const { toggleFeature } = useDispatch( 'core/edit-post' );
	const { disableTips } = useDispatch( 'core/nux' );

	const selectProps = useSelect( ( select ) => {
		const { isOpen, isPatternPicker } = select( pageLayoutStore );
		return {
			isOpen: isOpen(),
			isWelcomeGuideActive: (
				select( 'core/edit-post' ) as CoreEditPostPlaceholder
			 ).isFeatureActive( 'welcomeGuide' ) as boolean, // Gutenberg 7.2.0 or higher
			areTipsEnabled: select( 'core/nux' )
				? ( ( select( 'core/nux' ) as CoreNuxPlaceholder ).areTipsEnabled() as boolean )
				: false, // Gutenberg 7.1.0 or lower
			...( isPatternPicker() && {
				title: __( 'Choose a Pattern', 'full-site-editing' ),
				description: __(
					'Pick a pre-defined layout or continue with a blank page',
					'full-site-editing'
				),
			} ),
		};
	}, [] );

	const { getMeta, postContentBlock } = useSelect( ( select ) => {
		const getMeta = () =>
			( select( 'core/editor' ) as CoreEditorPlaceholder ).getEditedPostAttribute( 'meta' );
		const currentBlocks = ( select( 'core/editor' ) as CoreEditorPlaceholder ).getBlocks();
		return {
			getMeta,
			postContentBlock: currentBlocks.find( ( block ) => block.name === 'a8c/post-content' ),
		};
	}, [] );

	const savePatternChoice = useCallback(
		( name: string ) => {
			// Save selected pattern slug in meta.
			const currentMeta = getMeta() as Record< string, unknown >;
			editPost( {
				meta: {
					...currentMeta,
					_starter_page_template: name,
				},
			} );
		},
		[ editPost, getMeta ]
	);

	const insertPattern = useCallback(
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

	const handleClose = useCallback( () => {
		setUsedPageOrPatternsModal();
		setOpenState( 'CLOSED' );
	}, [ setOpenState, setUsedPageOrPatternsModal ] );

	return (
		<PagePatternModal
			{ ...selectProps }
			onClose={ handleClose }
			savePatternChoice={ savePatternChoice }
			insertPattern={ insertPattern }
			hideWelcomeGuide={ hideWelcomeGuide }
			{ ...props }
		/>
	);
}
