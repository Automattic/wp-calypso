/**
 * External dependencies
 */

import { filter, includes, isEmpty, last, noop } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';

const ESC_KEY_CODE = 27;
let components = [];

function onKeydown( event ) {
	if ( ! isEmpty( components ) && event.keyCode === ESC_KEY_CODE && ! isInput( event.target ) ) {
		const component = last( components );

		component.onEscape();
	}
}

function isInput( element ) {
	return includes( [ 'INPUT', 'TEXTAREA' ], element.nodeName );
}

function addKeydownListener() {
	document.addEventListener( 'keydown', onKeydown, true );
}

function removeKeydownListener() {
	document.removeEventListener( 'keydown', onKeydown, true );
}

function startCloseOnEscForComponent( component, onEscape ) {
	components.push( { component, onEscape } );
	if ( ! isEmpty( components ) ) {
		addKeydownListener();
	}
}

function stopCloseOnEscForComponent( component ) {
	components = filter( components, ( item ) => item.component !== component );
	if ( isEmpty( components ) ) {
		removeKeydownListener();
	}
}

class CloseOnEscape extends Component {
	componentDidMount() {
		startCloseOnEscForComponent( this, this.props.onEscape );
	}

	componentWillUnmount() {
		stopCloseOnEscForComponent( this, this.props.onEscape );
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
