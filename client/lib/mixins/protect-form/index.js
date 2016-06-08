/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:protect-form' ),
	page = require( 'page' ),
	i18n = require( 'i18n-calypso' );

var confirmText = i18n.translate( 'You have unsaved changes. Are you sure you want to leave this page?' ),
	beforeUnloadText = i18n.translate( 'You have unsaved changes.' ),
	formsChanged = [];

module.exports = {
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
		if ( ! formsChanged.length ) {
			return next();
		}
		debug( 'unsaved form changes detected' );
		if ( window.confirm( confirmText ) ) { // eslint-disable-line no-alert
			formsChanged = [];
			next();
		} else {
			// save off the current path just in case context changes after this call
			const currentPath = context.canonicalPath;
			setTimeout( function() {
				page.replace( currentPath, null, false, false );
			}, 0 );
		}
	}

};
