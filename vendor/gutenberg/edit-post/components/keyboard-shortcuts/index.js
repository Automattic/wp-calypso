/**
 * WordPress dependencies
 */
import { Component, compose } from '@wordpress/element';
import { KeyboardShortcuts } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import shortcuts from '../../keyboard-shortcuts';

class EditorModeKeyboardShortcuts extends Component {
	constructor() {
		super( ...arguments );

		this.toggleMode = this.toggleMode.bind( this );
	}

	toggleMode() {
		const { mode, switchMode } = this.props;
		switchMode( mode === 'visual' ? 'text' : 'visual' );
	}

	render() {
		return (
			<KeyboardShortcuts
				bindGlobal
				shortcuts={ {
					[ shortcuts.toggleEditorMode.value ]: this.toggleMode,
				} }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		return {
			mode: select( 'core/edit-post' ).getEditorMode(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			switchMode: ( mode ) => {
				dispatch( 'core/edit-post' ).switchEditorMode( mode );
			},
		};
	} ),
] )( EditorModeKeyboardShortcuts );
