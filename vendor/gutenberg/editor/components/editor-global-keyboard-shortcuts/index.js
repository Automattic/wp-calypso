/**
 * External dependencies
 */
import { first, last, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment, compose } from '@wordpress/element';
import { KeyboardShortcuts } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { rawShortcut } from '@wordpress/keycodes';

class EditorGlobalKeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );

		this.selectAll = this.selectAll.bind( this );
		this.undoOrRedo = this.undoOrRedo.bind( this );
		this.save = this.save.bind( this );
		this.deleteSelectedBlocks = this.deleteSelectedBlocks.bind( this );
		this.clearMultiSelection = this.clearMultiSelection.bind( this );
	}

	selectAll( event ) {
		const { uids, onMultiSelect } = this.props;
		event.preventDefault();
		onMultiSelect( first( uids ), last( uids ) );
	}

	undoOrRedo( event ) {
		const { onRedo, onUndo } = this.props;

		if ( event.shiftKey ) {
			onRedo();
		} else {
			onUndo();
		}

		event.preventDefault();
	}

	save( event ) {
		event.preventDefault();
		this.props.onSave();
	}

	deleteSelectedBlocks( event ) {
		const { multiSelectedBlockUids, onRemove, isLocked } = this.props;
		if ( multiSelectedBlockUids.length ) {
			event.preventDefault();
			if ( ! isLocked ) {
				onRemove( multiSelectedBlockUids );
			}
		}
	}

	/**
	 * Clears current multi-selection, if one exists.
	 */
	clearMultiSelection() {
		const { hasMultiSelection, clearSelectedBlock } = this.props;
		if ( hasMultiSelection ) {
			clearSelectedBlock();
			window.getSelection().removeAllRanges();
		}
	}

	render() {
		return (
			<Fragment>
				<KeyboardShortcuts
					shortcuts={ {
						[ rawShortcut.primary( 'a' ) ]: this.selectAll,
						[ rawShortcut.primary( 'z' ) ]: this.undoOrRedo,
						[ rawShortcut.primaryShift( 'z' ) ]: this.undoOrRedo,
						backspace: this.deleteSelectedBlocks,
						del: this.deleteSelectedBlocks,
						escape: this.clearMultiSelection,
					} }
				/>
				<KeyboardShortcuts
					bindGlobal
					shortcuts={ {
						[ rawShortcut.primary( 's' ) ]: this.save,
					} }
				/>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getBlockOrder,
			getMultiSelectedBlockUids,
			hasMultiSelection,
			isEditedPostDirty,
			getBlockRootUID,
			getTemplateLock,
		} = select( 'core/editor' );
		const multiSelectedBlockUids = getMultiSelectedBlockUids();

		return {
			uids: getBlockOrder(),
			multiSelectedBlockUids,
			hasMultiSelection: hasMultiSelection(),
			isLocked: some( multiSelectedBlockUids, ( uid ) => !! getTemplateLock( getBlockRootUID( uid ) ) ),
			isDirty: isEditedPostDirty(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const {
			clearSelectedBlock,
			multiSelect,
			redo,
			undo,
			removeBlocks,
			savePost,
		} = dispatch( 'core/editor' );

		return {
			onSave() {
				// TODO: This should be handled in the `savePost` effect in
				// considering `isSaveable`. See note on `isEditedPostSaveable`
				// selector about dirtiness and meta-boxes. When removing, also
				// remember to remove `isDirty` prop passing from `withSelect`.
				//
				// See: `isEditedPostSaveable`
				if ( ! ownProps.isDirty ) {
					return;
				}

				savePost();
			},
			clearSelectedBlock,
			onMultiSelect: multiSelect,
			onRedo: redo,
			onUndo: undo,
			onRemove: removeBlocks,
		};
	} ),
] )( EditorGlobalKeyboardShortcuts );
