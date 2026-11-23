import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { NoteOpenContext } from '../context';

// Every container listens on `window`, and an action can re-render another container
// with the same hotkey before that one's listener runs, so the others skip a key press
// one container handled. Not `event.defaultPrevented`: other code cancels key presses
// too, such as a focusable disabled button, and that mustn't turn the shortcuts off.
const handledEvents = new WeakSet();

const dispatch = ( event, action ) => {
	handledEvents.add( event );
	event.preventDefault();
	event.stopPropagation();

	action();
};

export class HotkeyContainer extends Component {
	static contextType = NoteOpenContext;

	static propTypes = {
		shortcuts: PropTypes.arrayOf(
			PropTypes.shape( {
				action: PropTypes.func.isRequired,
				hotkey: PropTypes.string.isRequired,
				withModifiers: PropTypes.bool,
			} )
		),
		children: PropTypes.node,
	};

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
	}

	handleKeyDown = ( event ) => {
		if (
			event.repeat ||
			handledEvents.has( event ) ||
			! this.context ||
			! this.props.shortcuts ||
			! this.props.keyboardShortcutsAreEnabled
		) {
			return;
		}

		const shortcut = this.props.shortcuts.find(
			( { hotkey, withModifiers = false } ) =>
				hotkey === event.key && withModifiers === modifierKeyIsActive( event )
		);

		if ( shortcut ) {
			dispatch( event, shortcut.action );
		}
	};

	render() {
		return this.props.children;
	}
}

const mapStateToProps = ( state ) => ( {
	keyboardShortcutsAreEnabled: getKeyboardShortcutsEnabled( state ),
} );

export default connect( mapStateToProps )( HotkeyContainer );
