/**
 * External dependencies
 */
import React, { ComponentType } from 'react';
import debugModule from 'debug';
import page from 'page';
import i18n from 'i18n-calypso';
import { Subtract } from 'utility-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:protect-form' );

type FormId = Record< string, unknown >;

let formsChanged = new Set< FormId >();
let listenerCount = 0;

function warnIfChanged( event: BeforeUnloadEvent ) {
	if ( ! formsChanged.size ) {
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

function markChanged( formId: FormId ) {
	if ( ! formsChanged.has( formId ) ) {
		formsChanged.add( formId );
	}
}

function markSaved( formId: FormId ) {
	formsChanged.delete( formId );
}

type ProtectForm = {
	markChanged: () => void;
	markSaved: () => void;
};

export const useProtectForm = (): ProtectForm => {
	const formId = React.useRef< FormId >( {} );
	const _markSaved = React.useCallback( () => markSaved( formId.current ), [] );
	const _markChanged = React.useCallback( () => markChanged( formId.current ), [] );

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

export interface ProtectedFormProps {
	markChanged: () => void;
	markSaved: () => void;
}

/*
 * HOC that passes markChanged/markSaved props to the wrapped component instance
 */
export const protectForm = < P extends ProtectedFormProps >(
	WrappedComponent: ComponentType< P >
): ComponentType< Subtract< P, ProtectedFormProps > > => (
	props: Subtract< P, ProtectedFormProps >
) => {
	const { markChanged, markSaved } = useProtectForm();

	return (
		<WrappedComponent { ...( props as P ) } markChanged={ markChanged } markSaved={ markSaved } />
	);
};

interface ProtectFormGuardProps {
	isChanged: boolean;
}

/*
 * Declarative variant that takes a 'isChanged' prop.
 */
export const ProtectFormGuard = ( { isChanged }: ProtectFormGuardProps ): null => {
	const { markChanged, markSaved } = useProtectForm();

	React.useEffect( () => {
		if ( isChanged ) {
			markChanged();
			return;
		}

		markSaved();

		() => {
			markSaved();
		};
	}, [ isChanged, markSaved, markChanged ] );

	return null;
};

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
	if ( ! formsChanged.size ) {
		return next();
	}
	debug( 'unsaved form changes detected' );
	if ( windowConfirm() ) {
		formsChanged = new Set< FormId >();
		next();
	} else {
		// save off the current path just in case context changes after this call
		const currentPath = context.canonicalPath;
		setTimeout( function () {
			page.replace( currentPath, null, false, false );
		}, 0 );
	}
};
