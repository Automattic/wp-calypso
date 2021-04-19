/**
 * External dependencies
 */
import React, { Component, ComponentType } from 'react';
import debugModule from 'debug';
import page from 'page';
import i18n from 'i18n-calypso';
import { includes, without } from 'lodash';
import { Subtract } from 'utility-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:protect-form' );

type ComponentMarkedWithFormChanges = Component | string;

let formsChanged: ComponentMarkedWithFormChanges[] = [];
let listenerCount = 0;

function warnIfChanged( event: BeforeUnloadEvent ) {
	if ( ! formsChanged.length ) {
		return;
	}
	debug( 'unsaved form changes detected' );
	const beforeUnloadText = i18n.translate( 'You have unsaved changes.' );
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

function markChanged( form: ComponentMarkedWithFormChanges ) {
	if ( ! includes( formsChanged, form ) ) {
		formsChanged.push( form );
	}
}

function markSaved( form: ComponentMarkedWithFormChanges ) {
	formsChanged = without( formsChanged, form );
}

export interface ProtectedFormProps {
	markChanged: () => void;
	markSaved: () => void;
}

/*
 * HOC that passes markChanged/markSaved props to the wrapped component instance
 */
export const protectForm = < P extends ProtectedFormProps >(
	WrappedComponent: ComponentType< P >
): ComponentType< Subtract< P, ProtectedFormProps > > =>
	class ProtectedFormComponent extends Component< Subtract< P, ProtectedFormProps > > {
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
					{ ...( this.props as P ) }
				/>
			);
		}
	};

interface ProtectFormGuardProps {
	isChanged: boolean;
}
/*
 * Declarative variant that takes a 'isChanged' prop.
 */
export class ProtectFormGuard extends Component< ProtectFormGuardProps > {
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

	UNSAFE_componentWillReceiveProps( nextProps: ProtectFormGuardProps ) {
		if ( nextProps.isChanged !== this.props.isChanged ) {
			nextProps.isChanged ? markChanged( this ) : markSaved( this );
		}
	}

	render() {
		return null;
	}
}

function windowConfirm() {
	if ( typeof window === 'undefined' ) {
		return true;
	}
	const confirmText = i18n.translate(
		'You have unsaved changes. Are you sure you want to leave this page?'
	);
	return window.confirm( confirmText );
}

export const checkFormHandler: PageJS.Callback = ( context, next ) => {
	if ( ! formsChanged.length ) {
		return next();
	}
	debug( 'unsaved form changes detected' );
	if ( windowConfirm() ) {
		formsChanged = [];
		next();
	} else {
		// save off the current path just in case context changes after this call
		const currentPath = context.canonicalPath;
		setTimeout( function () {
			page.replace( currentPath, null, false, false );
		}, 0 );
	}
};

type ProtectForm = {
	markChanged: () => void;
	markSaved: () => void;
};

export const useProtectForm = ( id: string ): ProtectForm => {
	const _markSaved = React.useCallback( () => markSaved( id ), [ id ] );
	const _markChanged = React.useCallback( () => markChanged( id ), [ id ] );

	React.useEffect( () => {
		addBeforeUnloadListener();

		return () => {
			removeBeforeUnloadListener();
			_markSaved();
		};
	}, [ _markSaved ] );

	return {
		markChanged: _markChanged,
		markSaved: _markSaved,
	};
};
