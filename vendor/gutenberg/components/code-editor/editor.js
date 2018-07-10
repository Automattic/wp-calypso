/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { UP, DOWN } from '@wordpress/keycodes';

class CodeEditor extends Component {
	constructor() {
		super( ...arguments );

		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
		this.onCursorActivity = this.onCursorActivity.bind( this );
		this.onKeyHandled = this.onKeyHandled.bind( this );
	}

	componentDidMount() {
		const settings = this.props.settings || window._wpGutenbergCodeEditorSettings;
		const instance = wp.codeEditor.initialize( this.textarea, settings );
		this.editor = instance.codemirror;

		this.editor.on( 'focus', this.onFocus );
		this.editor.on( 'blur', this.onBlur );
		this.editor.on( 'cursorActivity', this.onCursorActivity );
		this.editor.on( 'keyHandled', this.onKeyHandled );

		// Pass a reference to the editor back up.
		if ( this.props.editorRef ) {
			this.props.editorRef( this.editor );
		}

		this.updateFocus();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.value !== prevProps.value && this.editor.getValue() !== this.props.value ) {
			this.editor.setValue( this.props.value );
		}

		if ( this.props.focus !== prevProps.focus ) {
			this.updateFocus();
		}
	}

	componentWillUnmount() {
		this.editor.on( 'focus', this.onFocus );
		this.editor.off( 'blur', this.onBlur );
		this.editor.off( 'cursorActivity', this.onCursorActivity );
		this.editor.off( 'keyHandled', this.onKeyHandled );

		this.editor.toTextArea();
		this.editor = null;
	}

	onFocus() {
		if ( this.props.onFocus ) {
			this.props.onFocus();
		}
	}

	onBlur( editor ) {
		if ( this.props.onChange ) {
			this.props.onChange( editor.getValue() );
		}
	}

	onCursorActivity( editor ) {
		this.lastCursor = editor.getCursor();
	}

	onKeyHandled( editor, name, event ) {
		/*
		 * Pressing UP/DOWN should only move focus to another block if the cursor is
		 * at the start or end of the editor.
		 *
		 * We do this by stopping UP/DOWN from propagating if:
		 *  - We know what the cursor was before this event; AND
		 *  - This event caused the cursor to move
		 */
		if ( event.keyCode === UP || event.keyCode === DOWN ) {
			const areCursorsEqual = ( a, b ) => a.line === b.line && a.ch === b.ch;
			if ( this.lastCursor && ! areCursorsEqual( editor.getCursor(), this.lastCursor ) ) {
				event.stopImmediatePropagation();
			}
		}
	}

	updateFocus() {
		if ( this.props.focus && ! this.editor.hasFocus() ) {
			// Need to wait for the next frame to be painted before we can focus the editor
			window.requestAnimationFrame( () => {
				this.editor.focus();
			} );
		}

		if ( ! this.props.focus && this.editor.hasFocus() ) {
			document.activeElement.blur();
		}
	}

	render() {
		return <textarea ref={ ( ref ) => ( this.textarea = ref ) } defaultValue={ this.props.value } />;
	}
}

export default CodeEditor;
