/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import { __experimentalToolbarItem as ToolbarItem, Button, Popover } from '@wordpress/components';
import {
	BlockToolbar,
	NavigableToolbar,
	BlockNavigationDropdown,
	__experimentalLibrary as Library,
} from '@wordpress/block-editor';
import { TableOfContents } from '@wordpress/editor';
import { plus } from '@wordpress/icons';
import { useRef } from '@wordpress/element';

console.log( 'hello' );

/**
 * Internal dependencies
 */
import EditorHistoryRedo from './redo';
import EditorHistoryUndo from './undo';
import './style.scss';

function HeaderToolbar( props ) {
	const inserterButton = useRef();
	const { setIsInserterOpened } = useDispatch( 'isolated/editor' );
	const isMobileViewport = useViewportMatch( 'medium', '<' );
	const {
		hasFixedToolbar,
		isInserterEnabled,
		isTextModeEnabled,
		previewDeviceType,
		isInserterOpened,
	} = useSelect( ( select ) => {
		const { hasInserterItems, getBlockRootClientId, getBlockSelectionEnd } = select(
			'core/block-editor'
		);

		return {
			hasFixedToolbar: select( 'isolated/editor' ).isFeatureActive( 'fixedToolbar' ),
			// This setting (richEditingEnabled) should not live in the block editor's setting.
			isInserterEnabled:
				select( 'isolated/editor' ).getEditorMode() === 'visual' &&
				select( 'core/editor' ).getEditorSettings().richEditingEnabled &&
				hasInserterItems( getBlockRootClientId( getBlockSelectionEnd() ) ),
			isTextModeEnabled: select( 'isolated/editor' ).getEditorMode() === 'text',
			previewDeviceType: 'Desktop',
			isInserterOpened: select( 'isolated/editor' ).isInserterOpened(),
		};
	}, [] );
	const isLargeViewport = useViewportMatch( 'medium' );
	const { inserter, toc, navigation, undo } = props.settings.iso.toolbar;
	const displayBlockToolbar =
		! isLargeViewport || previewDeviceType !== 'Desktop' || hasFixedToolbar;
	const toolbarAriaLabel = displayBlockToolbar
		? /* translators: accessibility text for the editor toolbar when Top Toolbar is on */
		  __( 'Document and block tools' )
		: /* translators: accessibility text for the editor toolbar when Top Toolbar is off */
		  __( 'Document tools' );

	return (
		<NavigableToolbar className="edit-post-header-toolbar" aria-label={ toolbarAriaLabel }>
			<div className="edit-post-header-toolbar__left">
				{ inserter && (
					<ToolbarItem
						ref={ inserterButton }
						as={ Button }
						className="edit-post-header-toolbar__inserter-toggle"
						isPrimary
						isPressed={ isInserterOpened }
						onMouseDown={ ( event ) => {
							event.preventDefault();
						} }
						onClick={ () => {
							if ( isInserterOpened ) {
								// Focusing the inserter button closes the inserter popover
								inserterButton.current.focus();
							} else {
								setIsInserterOpened( true );
							}
						} }
						disabled={ ! isInserterEnabled }
						icon={ plus }
						label={ _x( 'Add block', 'Generic label for block inserter button' ) }
					/>
				) }

				{ isInserterOpened && (
					<Popover
						position="bottom right"
						onClose={ () => setIsInserterOpened( false ) }
						anchorRef={ inserterButton.current }
					>
						<Library
							showMostUsedBlocks={ false }
							showInserterHelpPanel
							onSelect={ () => {
								if ( isMobileViewport ) {
									setIsInserterOpened( false );
								}
							} }
						/>
					</Popover>
				) }

				{ undo && <ToolbarItem as={ EditorHistoryUndo } /> }
				{ undo && <ToolbarItem as={ EditorHistoryRedo } /> }
				{ navigation && (
					<ToolbarItem as={ BlockNavigationDropdown } isDisabled={ isTextModeEnabled } />
				) }
				{ toc && (
					<ToolbarItem as={ TableOfContents } hasOutlineItemsDisabled={ isTextModeEnabled } />
				) }
			</div>

			{ displayBlockToolbar && ! isTextModeEnabled && (
				<div className="edit-post-header-toolbar__block-toolbar">
					<BlockToolbar hideDragHandle />
				</div>
			) }
		</NavigableToolbar>
	);
}

export default HeaderToolbar;
