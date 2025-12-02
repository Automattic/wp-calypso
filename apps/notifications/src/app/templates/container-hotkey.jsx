import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';

const dispatch = ( event, action ) => {
	event.preventDefault();
	event.stopPropagation();

	action();
};

export class HotkeyContainer extends Component {
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
		if ( ! this.props.shortcuts || ! this.props.keyboardShortcutsAreEnabled ) {
			return;
		}

		this.props.shortcuts
			.filter( ( shortcut ) => shortcut.hotkey === event.key )
			.filter(
				( shortcut ) => ( shortcut.withModifiers || false ) === modifierKeyIsActive( event )
			)
			.forEach( ( shortcut ) => dispatch( event, shortcut.action ) );
	};

	render() {
		return this.props.children;
	}
}

const mapStateToProps = ( state ) => ( {
	keyboardShortcutsAreEnabled: getKeyboardShortcutsEnabled( state ),
} );

export default connect( mapStateToProps )( HotkeyContainer );
