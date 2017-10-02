/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import debugModule from 'debug';
import page from 'page';
import i18n from 'i18n-calypso';
import { includes, without } from 'lodash';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:protect-form' );
const confirmText = i18n.translate( 'You have unsaved changes. Are you sure you want to leave this page?' );
const beforeUnloadText = i18n.translate( 'You have unsaved changes.' );
let formsChanged = [];
let listenerCount = 0;

function warnIfChanged( event ) {
	if ( ! formsChanged.length ) {
		return;
	}
	debug( 'unsaved form changes detected' );
	( event || window.event ).returnValue = beforeUnloadText;
	return beforeUnloadText;
}

function addBeforeUnloadListener() {
	if ( listenerCount === 0 && typeof window !== 'undefined' ) {
		window.addEventListener( 'beforeunload', warnIfChanged );
	}
	listenerCount++;
}

function removeBeforeUnloadListener() {
	listenerCount--;
	if ( listenerCount === 0 && typeof window !== 'undefined' ) {
		window.removeEventListener( 'beforeunload', warnIfChanged );
	}
}

function markChanged( form ) {
	if ( ! includes( formsChanged, form ) ) {
		formsChanged.push( form );
	}
}

function markSaved( form ) {
	formsChanged = without( formsChanged, form );
}

/*
 * HOC that passes markChanged/markSaved props to the wrapped component instance
 */
export const protectForm = WrappedComponent => {
	return class ProtectedFormComponent extends Component {
		markChanged = () => markChanged( this );
		markSaved = () => markSaved( this );

		componentDidMount() {
			addBeforeUnloadListener();
		}

		componentWillUnmount() {
			removeBeforeUnloadListener();
			this.markSaved();
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
	};
};

/*
 * Declarative variant that takes a 'isChanged' prop.
 */
export class ProtectFormGuard extends Component {
	static propTypes = {
		isChanged: PropTypes.bool.isRequired
	}

	componentDidMount() {
		addBeforeUnloadListener();
		if ( this.props.isChanged ) {
			markChanged( this );
		}
	}

	componentWillUnmount() {
		removeBeforeUnloadListener();
		markSaved( this );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isChanged !== this.props.isChanged ) {
			nextProps.isChanged ? markChanged( this ) : markSaved( this );
		}
	}

	render() {
		return null;
	}
}

export const checkFormHandler = ( context, next ) => {
	if ( ! formsChanged.length ) {
		return next();
	}
	debug( 'unsaved form changes detected' );
	if ( typeof window === 'undefined' || window.confirm( confirmText ) ) {
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
