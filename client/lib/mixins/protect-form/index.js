/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:protect-form' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' );

var confirmText = i18n.translate( 'You have unsaved changes. Are you sure you want to leave this page?' ),
	beforeUnloadText = i18n.translate( 'You have unsaved changes.' ),
	formsChanged = [];

module.exports =  {

	mixin: {
		componentDidMount: function() {
			window.addEventListener( 'beforeunload', this.warnIfChanged );
		},
		componentWillUnmount: function() {
			window.removeEventListener( 'beforeunload', this.warnIfChanged );
		},
		warnIfChanged: function( event ) {
			if ( ! formsChanged.length ) {
				return;
			}
			debug( 'unsaved form changes detected' );
			( event || window.event ).returnValue = beforeUnloadText;
			return beforeUnloadText;
		},
		markChanged: function() {
			if ( -1 === formsChanged.indexOf( this ) ) {
				formsChanged.push( this );
			}
		},
		markSaved: function() {
			var index = formsChanged.indexOf( this );
			if ( -1 === index ) {
				return;
			}
			formsChanged.splice( index, 1 );
		}
	},
	checkFormHandler: function( context, next ) {
		if( ! formsChanged.length ) {
			return next();
		}
		debug( 'unsaved form changes detected' );
		if ( window.confirm( confirmText ) ) { // eslint-disable-line no-alert
			formsChanged = [];
			next();
		} else {
			setTimeout( function() {
				page.replace( context.prevPath , null, false, false);
			}, 0);
		}
	}

};
