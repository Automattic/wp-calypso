import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import type {
	AgencyApprovalStatus,
	AgencyTierId,
	AmplifyMode,
	AmplifyReport,
	AmplifyUsage,
} from '@automattic/api-core';
import './dev-state-controls.scss';

export type AmplifyPreviewMode = 'live' | 'first' | 'one' | 'dozens' | 'loading' | 'error';
export type AmplifyUsagePreview =
	'live' | 'fresh' | 'low' | 'cap-activated' | 'cap-partner' | 'pending' | 'rejected';
type Settings = {
	mode: AmplifyPreviewMode;
	usage: AmplifyUsagePreview;
	x: number;
	y: number;
	collapsed: boolean;
};

const STORAGE_KEY = 'a4a-amplify-dev-state-controls-v1';
const PANEL_WIDTH = 224;
const DEFAULT_SETTINGS: Settings = {
	mode: 'live',
	usage: 'live',
	x: 16,
	y: 16,
	collapsed: false,
};
const MODES: AmplifyPreviewMode[] = [ 'live', 'first', 'one', 'dozens', 'loading', 'error' ];
const USAGE_PREVIEWS: { value: AmplifyUsagePreview; label: string }[] = [
	{ value: 'live', label: __( 'Live usage' ) },
	{ value: 'fresh', label: __( 'Plenty left (3 of 15)' ) },
	{ value: 'low', label: __( 'Running low (13 of 15)' ) },
	{ value: 'cap-activated', label: __( 'At cap, Account activated' ) },
	{ value: 'cap-partner', label: __( 'At cap, Agency Partner+' ) },
	{ value: 'pending', label: __( 'Awaiting review' ) },
	{ value: 'rejected', label: __( 'Not approved' ) },
];

function firstOfNextMonthUtc() {
	const now = new Date();
	return new Date( Date.UTC( now.getUTCFullYear(), now.getUTCMonth() + 1, 1 ) ).toISOString();
}

export function makePreviewUsage( preview: AmplifyUsagePreview ): {
	usage: AmplifyUsage;
	tierId: AgencyTierId | undefined;
	approvalStatus: AgencyApprovalStatus;
} | null {
	const resets_at = firstOfNextMonthUtc();
	const approved = 'approved' as const;
	switch ( preview ) {
		case 'fresh':
			return {
				usage: { used: 3, limit: 15, resets_at },
				tierId: 'agency-partner',
				approvalStatus: approved,
			};
		case 'low':
			return {
				usage: { used: 13, limit: 15, resets_at },
				tierId: 'agency-partner',
				approvalStatus: approved,
			};
		case 'cap-activated':
			return {
				usage: { used: 5, limit: 5, resets_at },
				tierId: 'emerging-partner',
				approvalStatus: approved,
			};
		case 'cap-partner':
			return {
				usage: { used: 15, limit: 15, resets_at },
				tierId: 'agency-partner',
				approvalStatus: approved,
			};
		case 'pending':
			return {
				usage: { used: 0, limit: 5, resets_at },
				tierId: 'emerging-partner',
				approvalStatus: 'pending',
			};
		case 'rejected':
			return {
				usage: { used: 0, limit: 0, resets_at },
				tierId: undefined,
				approvalStatus: 'rejected',
			};
		default:
			return null;
	}
}

function clamp( value: number, max: number ) {
	return Math.max( 0, Math.min( value, max ) );
}

function readSettings(): Settings {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_SETTINGS;
	}
	try {
		const saved = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) ?? '{}' );
		let savedMode = saved.mode;
		if ( savedMode === 'empty' ) {
			savedMode = 'first';
		} else if ( savedMode === 'many' ) {
			savedMode = 'dozens';
		}
		return {
			mode: MODES.includes( savedMode ) ? savedMode : DEFAULT_SETTINGS.mode,
			usage: USAGE_PREVIEWS.some( ( option ) => option.value === saved.usage )
				? saved.usage
				: DEFAULT_SETTINGS.usage,
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

export function useAmplifyDevSettings( enabled: boolean ) {
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

export function makePreviewReports( count: number ): AmplifyReport[] {
	const modes: AmplifyMode[] = [ 'full', 'human', 'ai' ];
	const exampleSites = [ 'automattic.com', 'wordpress.com', 'jetpack.com', 'woocommerce.com' ];
	return Array.from( { length: count }, ( _, index ): AmplifyReport => {
		const createdAt = new Date( Date.now() - index * 86_400_000 ).toISOString();
		const hostname = exampleSites[ index % exampleSites.length ];
		let status: AmplifyReport[ 'status' ] = 'completed';
		if ( count > 1 && index === 1 ) {
			status = 'in_progress';
		} else if ( count > 1 && index === 2 ) {
			status = 'failed';
		}
		return {
			id: `amplify-preview-${ index + 1 }`,
			status,
			url: `https://${ hostname }`,
			site_title: hostname,
			mode: modes[ index % modes.length ],
			created_at: createdAt,
			updated_at: createdAt,
			user_id: 0,
			score: {
				human: index % 3 === 2 ? null : 42 + ( ( index * 13 ) % 55 ),
				ai: index % 3 === 1 ? null : 38 + ( ( index * 17 ) % 60 ),
			},
			pdf_url: null,
			archived: false,
			failure_reason:
				status === 'failed' ? 'The site took too long to load, so the audit timed out.' : null,
		};
	} );
}

export default function AmplifyDevStateControls( {
	settings,
	onChange,
}: {
	settings: Settings;
	onChange: React.Dispatch< React.SetStateAction< Settings > >;
} ) {
	const dragStart = useRef< { pointerX: number; pointerY: number; x: number; y: number } | null >(
		null
	);
	const options: { value: AmplifyPreviewMode; label: string }[] = [
		{ value: 'live', label: __( 'Live data' ) },
		{ value: 'first', label: __( 'First visit' ) },
		{ value: 'one', label: __( 'One report' ) },
		{ value: 'dozens', label: __( 'Dozens of reports' ) },
		{ value: 'loading', label: __( 'Loading' ) },
		{ value: 'error', label: __( 'Error' ) },
	];
	return (
		<aside
			className="dashboard-amplify-dev-controls"
			data-collapsed={ settings.collapsed }
			style={ { left: settings.x, top: settings.y } }
			aria-label={ __( 'Amplify design controls' ) }
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
				<strong>{ __( 'Amplify states' ) }</strong>
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
				<fieldset>
					<legend>{ __( 'Persona' ) }</legend>
					<div className="dashboard-amplify-dev-controls__choices">
						{ options.map( ( option ) => (
							<label key={ option.value }>
								<input
									type="radio"
									name="amplify-dev-state"
									value={ option.value }
									checked={ settings.mode === option.value }
									onChange={ () =>
										onChange( ( previous ) => ( { ...previous, mode: option.value } ) )
									}
								/>
								{ option.label }
							</label>
						) ) }
					</div>
				</fieldset>
				<fieldset>
					<legend>{ __( 'Usage' ) }</legend>
					<div className="dashboard-amplify-dev-controls__choices">
						{ USAGE_PREVIEWS.map( ( option ) => (
							<label key={ option.value }>
								<input
									type="radio"
									name="amplify-dev-usage"
									value={ option.value }
									checked={ settings.usage === option.value }
									onChange={ () =>
										onChange( ( previous ) => ( { ...previous, usage: option.value } ) )
									}
								/>
								{ option.label }
							</label>
						) ) }
					</div>
				</fieldset>
				<button
					type="button"
					className="dashboard-amplify-dev-controls__reset"
					onClick={ () =>
						onChange( ( previous ) => ( {
							...previous,
							mode: 'live',
							usage: 'live',
						} ) )
					}
				>
					{ __( 'Reset to live data' ) }
				</button>
			</div>
		</aside>
	);
}
