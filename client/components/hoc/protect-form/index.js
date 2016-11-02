/**
 * External dependencies
 */
import React, { Component } from 'react';
import debugModule from 'debug';
import page from 'page';
import i18n from 'i18n-calypso';
import { without } from 'lodash';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:protect-form' );
const confirmText = i18n.translate( 'You have unsaved changes. Are you sure you want to leave this page?' );
const beforeUnloadText = i18n.translate( 'You have unsaved changes.' );
let formsChanged = [];

export const protectForm = WrappedComponent => {
	class ProtectedFormComponent extends Component {
		componentDidMount() {
			window.addEventListener( 'beforeunload', this.warnIfChanged );
		}

		componentWillUnmount() {
			window.removeEventListener( 'beforeunload', this.warnIfChanged );
			formsChanged = without( formsChanged, this );
		}

		warnIfChanged = event => {
			if ( ! formsChanged.length ) {
				return;
			}
			debug( 'unsaved form changes detected' );
			( event || window.event ).returnValue = beforeUnloadText;
			return beforeUnloadText;
		};

		markChanged = () => {
			if ( -1 === formsChanged.indexOf( this ) ) {
				formsChanged.push( this );
			}
		};

		markSaved = () => {
			const index = formsChanged.indexOf( this );
			if ( -1 === index ) {
				return;
			}
			formsChanged.splice( index, 1 );
		}

		render() {
			return (
				<WrappedComponent
					markChanged={ this.markChanged }
					markSaved={ this.markSaved }
					{ ...this.props }
				/>
			);
		}
	}

	return ProtectedFormComponent;
};

export const checkFormHandler = ( context, next ) => {
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
};
