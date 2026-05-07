import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type { ReactNode } from 'react';

import './style.scss';

const KONAMI_SEQUENCE: readonly string[] = [
	'arrowup',
	'arrowup',
	'arrowdown',
	'arrowdown',
	'arrowleft',
	'arrowright',
	'arrowleft',
	'arrowright',
	'b',
	'a',
];

const KONAMI_KEYS = new Set( KONAMI_SEQUENCE );

const ARCADE_BODY_CLASS = 'is-arcade-mode';
const ARCADE_FLASH_CLASS = 'is-arcade-mode--just-activated';
const FLASH_DURATION_MS = 1500;
const FONT_LINK_ID = 'arcade-mode-font';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';

type ArcadeModeContextValue = {
	isActive: boolean;
	activate: () => void;
	deactivate: () => void;
};

const ArcadeModeContext = createContext< ArcadeModeContextValue >( {
	isActive: false,
	activate: () => {},
	deactivate: () => {},
} );

export function useArcadeMode(): ArcadeModeContextValue {
	return useContext( ArcadeModeContext );
}

function isEditableTarget( target: EventTarget | null ): boolean {
	if ( ! ( target instanceof HTMLElement ) ) {
		return false;
	}
	const tag = target.tagName;
	if ( tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ) {
		return true;
	}
	return target.isContentEditable;
}

export function matchesKonamiSequence( buffer: readonly string[] ): boolean {
	if ( buffer.length < KONAMI_SEQUENCE.length ) {
		return false;
	}
	const tail = buffer.slice( buffer.length - KONAMI_SEQUENCE.length );
	return tail.every( ( key, i ) => key === KONAMI_SEQUENCE[ i ] );
}

export function ArcadeModeProvider( { children }: { children: ReactNode } ) {
	const [ isActive, setIsActive ] = useState( false );

	const activate = useCallback( () => {
		setIsActive( true );
	}, [] );

	const deactivate = useCallback( () => {
		setIsActive( false );
	}, [] );

	useEffect( () => {
		if ( ! isActive ) {
			return;
		}

		document.body.classList.add( ARCADE_BODY_CLASS, ARCADE_FLASH_CLASS );

		if ( ! document.getElementById( FONT_LINK_ID ) ) {
			const link = document.createElement( 'link' );
			link.id = FONT_LINK_ID;
			link.rel = 'stylesheet';
			link.href = FONT_HREF;
			document.head.appendChild( link );
		}

		const flashTimeout = window.setTimeout( () => {
			document.body.classList.remove( ARCADE_FLASH_CLASS );
		}, FLASH_DURATION_MS );

		return () => {
			window.clearTimeout( flashTimeout );
			document.body.classList.remove( ARCADE_BODY_CLASS, ARCADE_FLASH_CLASS );
		};
	}, [ isActive ] );

	const value = useMemo(
		() => ( { isActive, activate, deactivate } ),
		[ isActive, activate, deactivate ]
	);

	return <ArcadeModeContext.Provider value={ value }>{ children }</ArcadeModeContext.Provider>;
}

export function KonamiListener() {
	const { activate, deactivate, isActive } = useArcadeMode();
	const bufferRef = useRef< string[] >( [] );

	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.metaKey || event.ctrlKey || event.altKey || event.repeat ) {
				return;
			}
			if ( isEditableTarget( event.target ) ) {
				return;
			}

			if ( isActive ) {
				if ( event.key === 'Escape' ) {
					deactivate();
				}
				return;
			}

			const key = event.key.toLowerCase();
			if ( ! KONAMI_KEYS.has( key ) ) {
				return;
			}

			const buffer = bufferRef.current;
			buffer.push( key );
			if ( buffer.length > KONAMI_SEQUENCE.length ) {
				buffer.shift();
			}

			if ( matchesKonamiSequence( buffer ) ) {
				buffer.length = 0;
				activate();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => {
			document.removeEventListener( 'keydown', handleKeyDown );
		};
	}, [ activate, deactivate, isActive ] );

	return null;
}
