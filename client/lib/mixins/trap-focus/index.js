/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	without = require( 'lodash/array/without' ),
	difference = require( 'lodash/array/difference' );

var allowedCssClasses = [],
	components = [];

// the Community Translator is always allowed to open
allowedCssClasses.push( 'community-translator' );

function startTrapFocusForComponent( component ) {
	components.push( component );

	if ( components.length > 0 ) {
		addFocusListener();
	}
}

function stopTrapFocusForComponent( component ) {
	components = without( components, component );

	if ( components.length < 1 ) {
		removeFocusListener();
	}
}

function addFocusListener() {
	document.addEventListener( 'focus', onFocus, true);
}

function removeFocusListener() {
	document.removeEventListener( 'focus', onFocus, true );
}

function _doesNodeOrParentHaveAllowedCssClass( node ) {
	while ( node ) {

		if ( containsAllowedCssClass( node.className ) ) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

function containsAllowedCssClass( cssClassString ) {
	if ( 'string' !== typeof cssClassString ) {
		return false;
	}
	var cssClasses = cssClassString.split(' ');

	// true if one of the elements of allowedCssClasses appears in cssClasses
	return difference( allowedCssClasses, cssClasses ).length !== allowedCssClasses.length;
}

function onFocus( event ) {
	var topMostComponent,
		node;

	if ( components.length > 0 ) {
		if ( _doesNodeOrParentHaveAllowedCssClass( event.target ) ) {
			return true;
		}

		topMostComponent = components[ components.length - 1 ];
		node = ReactDom.findDOMNode( topMostComponent );

		if ( node.contains( event.target ) ) {
			return true;
		}

		event.stopPropagation();
		node.focus();
	}
}

var trapFocus = {
	componentDidMount: function() {
		startTrapFocusForComponent( this );
	},

	componentWillUnmount: function() {
		stopTrapFocusForComponent( this );
	}
};

module.exports = trapFocus;
