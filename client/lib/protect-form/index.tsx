import { createHigherOrderComponent } from '@wordpress/compose';
import debugModule from 'debug';
import i18n from 'i18n-calypso';
import page from 'page';
import { useRef, useCallback, useEffect } from 'react';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:protect-form' );

type FormId = [  ];

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
	formsChanged.add( formId );
}

function markSaved( formId: FormId ) {
	formsChanged.delete( formId );
}

type ProtectForm = {
	markChanged: () => void;
	markSaved: () => void;
};

export const useProtectForm = (): ProtectForm => {
	const formId = useRef< FormId >( [] );
	const _markSaved = useCallback( () => markSaved( formId.current ), [] );
	const _markChanged = useCallback( () => markChanged( formId.current ), [] );

	useEffect( () => {
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
export const protectForm = createHigherOrderComponent( ( Component ) => {
	return ( props ) => {
		const { markChanged, markSaved } = useProtectForm();

		return <Component { ...props } markChanged={ markChanged } markSaved={ markSaved } />;
	};
}, 'protectForm' );

/*
 * Declarative variant that takes a 'isChanged' prop.
 */
export const ProtectFormGuard = ( { isChanged }: { isChanged: boolean } ): null => {
	const { markChanged, markSaved } = useProtectForm();

	useEffect( () => {
		if ( isChanged ) {
			markChanged();
			return () => markSaved();
		}
	}, [ isChanged, markChanged, markSaved ] );

	return null;
};

function windowConfirm() {
	if ( typeof window === 'undefined' ) {
		return true;
	}
	const confirmText = i18n.translate(
		'You have unsaved changes. Are you sure you want to leave this page?',
		{ textOnly: true }
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
