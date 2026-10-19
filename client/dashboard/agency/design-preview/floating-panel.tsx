import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../amplify/dev-state-controls.scss';

type Settings = { x: number; y: number; collapsed: boolean; hidden: boolean; advanced: boolean };
const STORAGE_KEY = 'a4a-sites-migrations-panel-v2';
const PANEL_WIDTH = 224;
const DEFAULT_SETTINGS: Settings = {
	x: 16,
	y: 16,
	collapsed: false,
	hidden: false,
	advanced: false,
};
function clamp( value: number, max: number ) {
	return Math.max( 0, Math.min( value, max ) );
}

function readSettings(): Settings {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_SETTINGS;
	}
	try {
		const saved = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) ?? '{}' );
		return {
			hidden: saved.hidden === true,
			advanced: saved.advanced === true,
			x: Number.isFinite( saved.x )
				? clamp( saved.x, window.innerWidth - PANEL_WIDTH )
				: DEFAULT_SETTINGS.x,
			y: Number.isFinite( saved.y )
				? clamp( saved.y, window.innerHeight - 48 )
				: DEFAULT_SETTINGS.y,
			collapsed: saved.collapsed === true,
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export function usePreviewPanelSettings( enabled: boolean ) {
	const [ settings, setSettings ] = useState< Settings >( DEFAULT_SETTINGS );
	const [ isReady, setIsReady ] = useState( false );

	useEffect( () => {
		if ( enabled ) {
			setSettings( readSettings() );
		}
		setIsReady( true );
	}, [ enabled ] );

	useEffect( () => {
		if ( ! enabled || ! isReady ) {
			return;
		}
		try {
			window.localStorage.setItem( STORAGE_KEY, JSON.stringify( settings ) );
		} catch {
			// The preview still works when browser storage is unavailable.
		}
	}, [ enabled, isReady, settings ] );

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}
		const clampToViewport = () =>
			setSettings( ( previous ) => ( {
				...previous,
				x: clamp( previous.x, window.innerWidth - PANEL_WIDTH ),
				y: clamp( previous.y, window.innerHeight - 48 ),
			} ) );
		window.addEventListener( 'resize', clampToViewport );
		return () => window.removeEventListener( 'resize', clampToViewport );
	}, [ enabled ] );

	return [ settings, setSettings, isReady ] as const;
}

export default function FloatingPreviewPanel( {
	title,
	children,
	settings,
	onChange,
}: {
	title: string;
	children: React.ReactNode;
	settings: Settings;
	onChange: React.Dispatch< React.SetStateAction< Settings > >;
} ) {
	const dragStart = useRef< { pointerX: number; pointerY: number; x: number; y: number } | null >(
		null
	);

	if ( settings.hidden ) {
		return createPortal(
			<button
				type="button"
				className="dashboard-amplify-dev-controls dashboard-amplify-dev-controls__show"
				style={ { left: settings.x, top: settings.y } }
				onClick={ () => onChange( ( previous ) => ( { ...previous, hidden: false } ) ) }
			>
				Show { title.toLowerCase() }
			</button>,
			document.body
		);
	}
	return createPortal(
		<aside
			className="dashboard-amplify-dev-controls agency-design-preview-panel"
			data-collapsed={ settings.collapsed }
			style={ { left: settings.x, top: settings.y } }
			aria-label={ title }
		>
			<div
				className="dashboard-amplify-dev-controls__handle"
				onPointerDown={ ( event ) => {
					if ( event.button !== 0 || ( event.target as HTMLElement ).closest( 'button' ) ) {
						return;
					}
					dragStart.current = {
						pointerX: event.clientX,
						pointerY: event.clientY,
						x: settings.x,
						y: settings.y,
					};
					event.currentTarget.setPointerCapture( event.pointerId );
				} }
				onPointerMove={ ( event ) => {
					if ( ! dragStart.current ) {
						return;
					}
					const { pointerX, pointerY, x, y } = dragStart.current;
					onChange( ( previous ) => ( {
						...previous,
						x: clamp( x + event.clientX - pointerX, window.innerWidth - PANEL_WIDTH ),
						y: clamp( y + event.clientY - pointerY, window.innerHeight - 48 ),
					} ) );
				} }
				onPointerUp={ () => {
					dragStart.current = null;
				} }
				onPointerCancel={ () => {
					dragStart.current = null;
				} }
			>
				<strong>{ title }</strong>
				<button
					type="button"
					className="dashboard-amplify-dev-controls__collapse"
					onClick={ () => onChange( ( previous ) => ( { ...previous, hidden: true } ) ) }
				>
					Hide
				</button>
				<button
					type="button"
					className="dashboard-amplify-dev-controls__collapse"
					aria-expanded={ ! settings.collapsed }
					aria-controls="dashboard-amplify-dev-controls-body"
					onClick={ () =>
						onChange( ( previous ) => ( { ...previous, collapsed: ! previous.collapsed } ) )
					}
				>
					{ settings.collapsed ? __( 'Expand' ) : __( 'Collapse' ) }
				</button>
			</div>
			<div id="dashboard-amplify-dev-controls-body" hidden={ settings.collapsed }>
				{ children }
			</div>
		</aside>,
		document.body
	);
}
