import { filter, last } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';

const noop = () => {};
const ESC_KEY_CODE = 27;
let components = [];

function onKeydown( event ) {
	if ( components.length && event.keyCode === ESC_KEY_CODE && ! isInput( event.target ) ) {
		const component = last( components );

		component.onEscape();
	}
}

function isInput( element ) {
	return [ 'INPUT', 'TEXTAREA' ].includes( element.nodeName );
}

function addKeydownListener() {
	document.addEventListener( 'keydown', onKeydown, true );
}

function removeKeydownListener() {
	document.removeEventListener( 'keydown', onKeydown, true );
}

function startCloseOnEscForComponent( component, onEscape ) {
	components.push( { component, onEscape } );
	if ( components.length ) {
		addKeydownListener();
	}
}

function stopCloseOnEscForComponent( component ) {
	components = filter( components, ( item ) => item.component !== component );
	if ( ! components.length ) {
		removeKeydownListener();
	}
}

class CloseOnEscape extends Component {
	componentDidMount() {
		startCloseOnEscForComponent( this, this.props.onEscape );
	}

	componentWillUnmount() {
		stopCloseOnEscForComponent( this );
	}

	render() {
		return null;
	}
}

CloseOnEscape.propTypes = {
	onEscape: PropTypes.func,
};

CloseOnEscape.defaultProps = {
	onEscape: noop,
};

export default CloseOnEscape;
