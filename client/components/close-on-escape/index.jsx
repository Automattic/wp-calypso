/**
 * External dependencies
 */
import { noop, last, filter } from 'lodash';
import { Component, PropTypes } from 'react';

let components = [];

function onKeydown( event ) {
	if ( components.length > 0 && event.keyCode === 27 && ! isInput( event.target ) ) { // ESC
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
