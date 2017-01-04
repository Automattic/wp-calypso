/**
 * External dependencies
 */
import { filter, isEmpty, last, noop } from 'lodash';
import { Component, PropTypes } from 'react';

const ESC_KEY_CODE = 27;
let components = [];

function onKeydown( event ) {
	if (
		! isEmpty( components ) &&
		event.keyCode === ESC_KEY_CODE &&
		! isInput( event.target )
	) {
		const component = last( components );

		component.onEscape();
	}
}

function isInput( element ) {
	return -1 !== [ 'INPUT', 'TEXTAREA' ].indexOf( element.nodeName );
}

function addKeydownListener() {
	document.addEventListener( 'keydown', onKeydown, true );
}

function removeKeydownListener() {
	document.removeEventListener( 'keydown', onKeydown, true );
}

function startCloseOnEscForComponent( component, onEscape ) {
	components.push( { component, onEscape } );
	if ( components.length > 0 ) {
		addKeydownListener();
	}
}

function stopCloseOnEscForComponent( component ) {
	components = filter( components, item => item.component !== component );
	if ( components.length < 1 ) {
		removeKeydownListener();
	}
}

export default class CloseOnEscape extends Component {

	static propTypes = {
		onEscape: PropTypes.func,
	};

	static defaultProps = {
		onEscape: noop,
	};

	componentDidMount = () => {
		startCloseOnEscForComponent( this, this.props.onEscape );
	};

	componentWillUnmount = () => {
		stopCloseOnEscForComponent( this, this.props.onEscape );
	};

	render() {
		return null;
	}

}
