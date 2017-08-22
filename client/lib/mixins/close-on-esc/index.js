/**
 * External dependencies
 */
import { filter, last } from 'lodash';

var components = [];

function startCloseOnEscForComponent( component, closeMethod ) {
	components.push( { component: component, closeMethod: closeMethod } );

	if ( components.length > 0 ) {
		addKeydownListener();
	}
}

function stopCloseOnEscForComponent( component ) {
	components = filter( components, function( item ) {
		return item.component !== component;
	} );

	if ( components.length < 1 ) {
		removeKeydownListener();
	}
}

function addKeydownListener() {
	document.addEventListener( 'keydown', onKeydown, true);
}

function removeKeydownListener() {
	document.removeEventListener( 'keydown', onKeydown, true );
}

function isInput( element ) {
	return -1 !== [ 'INPUT', 'TEXTAREA' ].indexOf( element.nodeName );
}

function onKeydown( event ) {
	var item,
		component,
		closeMethod;

	if ( components.length > 0 && event.keyCode === 27 && ! isInput( event.target ) ) { // ESC
		item = last( components );
		component = item.component;
		closeMethod = item.closeMethod;

		component[ closeMethod ]();
	}
}

function closeOnEsc( closeMethod ) {
	return {
		componentDidMount: function () {
			startCloseOnEscForComponent( this, closeMethod );
		},

		componentWillUnmount: function () {
			stopCloseOnEscForComponent( this );
		}
	};
}

module.exports = closeOnEsc;
