import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isTyping, modifierKeyIsActive } from '../../panel/helpers/input';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { NoteOpenContext, useAppContext } from '../context';
import { isPanelMounted } from '../panel-mounted';

// Every container listens on `window`, and an action can re-render another container
// with the same hotkey before that one's listener runs, so the others skip a key press
// one container handled. Not `event.defaultPrevented`: other code cancels key presses
// too, such as a focusable disabled button, and that mustn't turn the shortcuts off.
const handledEvents = new WeakSet();

// A host with a scope, like the full page, shares the window with the rest of its page and with the
// panel opened over it. It leaves every key press to a mounted panel, and otherwise takes those from
// inside the scope or with nothing focused. It doesn't use the shared on/off switch, which a reply
// box turns back on only if React sees it lose focus.
const isForScope = ( { target }, shortcutScope ) =>
	! isPanelMounted() &&
	( target === document.body ||
		( target instanceof Node && !! shortcutScope.current?.contains( target ) ) );

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
		shortcutScope: PropTypes.shape( { current: PropTypes.object } ),
		children: PropTypes.node,
	};

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleKeyDown, false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleKeyDown, false );
	}

	handleKeyDown = ( event ) => {
		const { shortcuts, shortcutScope, keyboardShortcutsAreEnabled } = this.props;

		if (
			event.repeat ||
			handledEvents.has( event ) ||
			! this.context ||
			! shortcuts ||
			isTyping( event ) ||
			! ( shortcutScope ? isForScope( event, shortcutScope ) : keyboardShortcutsAreEnabled )
		) {
			return;
		}

		const shortcut = shortcuts.find(
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

const ConnectedHotkeyContainer = connect( mapStateToProps )( HotkeyContainer );

export default function ScopedHotkeyContainer( props ) {
	const { shortcutScope } = useAppContext();

	return <ConnectedHotkeyContainer shortcutScope={ shortcutScope } { ...props } />;
}
