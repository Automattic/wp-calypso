import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import type { AmplifyMode, AmplifyReport } from '@automattic/api-core';
import './dev-state-controls.scss';

export type AmplifyPreviewMode = 'live' | 'first' | 'one' | 'dozens' | 'loading' | 'error';
export type AmplifyHero =
	| 'tracing'
	| 'audit'
	| 'improve'
	| 'layers'
	| 'findings-a1'
	| 'findings-a2'
	| 'findings-a3'
	| 'findings-a4'
	| 'findings-a5'
	| 'findings-a6'
	| 'before-after'
	| 'report-tile';
type HeroTone = 'original' | 'warm' | 'cool' | 'mono' | 'vivid' | 'custom';
export type AmplifyHeroTweaks = {
	tone: HeroTone;
	noiseStrength: number;
	grainSize: number;
	hue: number;
	saturation: number;
	contrast: number;
	brightness: number;
	height: number;
	zoom: number;
	blur: number;
	fadeStart: number;
	fadeEnd: number;
};
type Settings = {
	mode: AmplifyPreviewMode;
	hero: AmplifyHero;
	heroTweaks: AmplifyHeroTweaks;
	x: number;
	y: number;
	advanced: boolean;
	collapsed: boolean;
};

const STORAGE_KEY = 'a4a-amplify-dev-state-controls-v1';
const PANEL_WIDTH = 224;
export const DEFAULT_HERO_TWEAKS: AmplifyHeroTweaks = {
	tone: 'custom',
	noiseStrength: 13,
	grainSize: 200,
	hue: -162,
	saturation: 66,
	contrast: 100,
	brightness: 101,
	height: 94,
	zoom: 100,
	blur: 1,
	fadeStart: 31,
	fadeEnd: 66,
};
const TONE_PRESETS: Record<
	Exclude< HeroTone, 'custom' >,
	Pick< AmplifyHeroTweaks, 'hue' | 'saturation' | 'contrast' | 'brightness' >
> = {
	original: { hue: 0, saturation: 100, contrast: 100, brightness: 100 },
	warm: { hue: -8, saturation: 110, contrast: 103, brightness: 102 },
	cool: { hue: 14, saturation: 98, contrast: 105, brightness: 100 },
	mono: { hue: 0, saturation: 0, contrast: 108, brightness: 105 },
	vivid: { hue: 0, saturation: 132, contrast: 112, brightness: 100 },
};
const TONES: { value: HeroTone; label: string }[] = [
	{ value: 'original', label: __( 'Original' ) },
	{ value: 'warm', label: __( 'Warm' ) },
	{ value: 'cool', label: __( 'Cool' ) },
	{ value: 'mono', label: __( 'Mono' ) },
	{ value: 'vivid', label: __( 'Vivid' ) },
	{ value: 'custom', label: __( 'Custom' ) },
];
const DEFAULT_SETTINGS: Settings = {
	mode: 'live',
	hero: 'before-after',
	heroTweaks: DEFAULT_HERO_TWEAKS,
	x: 16,
	y: 16,
	advanced: false,
	collapsed: false,
};
const MODES: AmplifyPreviewMode[] = [ 'live', 'first', 'one', 'dozens', 'loading', 'error' ];
const HEROES: { value: AmplifyHero; label: string }[] = [
	{ value: 'tracing', label: __( 'Tracing paper' ) },
	{ value: 'audit', label: __( 'Precision audit' ) },
	{ value: 'improve', label: __( 'Before / after' ) },
	{ value: 'layers', label: __( 'Exploded view' ) },
	{ value: 'findings-a1', label: __( 'A1: Findings with lines' ) },
	{ value: 'findings-a2', label: __( 'A2: Close-up' ) },
	{ value: 'findings-a3', label: __( 'A3: Findings list' ) },
	{ value: 'findings-a4', label: __( 'A4: Visitors and AI' ) },
	{ value: 'findings-a5', label: __( 'A5: Findings, one AI' ) },
	{ value: 'findings-a6', label: __( 'A6: Abstract' ) },
	{ value: 'before-after', label: __( 'C: Before and after' ) },
	{ value: 'report-tile', label: __( 'B: Report on homepage' ) },
];

function clamp( value: number, max: number ) {
	return Math.max( 0, Math.min( value, max ) );
}

function savedNumber( value: unknown, min: number, max: number, fallback: number ) {
	return typeof value === 'number' && Number.isFinite( value )
		? Math.max( min, Math.min( value, max ) )
		: fallback;
}

function readSettings(): Settings {
	if ( typeof window === 'undefined' ) {
		return DEFAULT_SETTINGS;
	}
	try {
		const saved = JSON.parse( window.localStorage.getItem( STORAGE_KEY ) ?? '{}' );
		const tweaks = saved.heroTweaks ?? {};
		let savedMode = saved.mode;
		if ( savedMode === 'empty' ) {
			savedMode = 'first';
		} else if ( savedMode === 'many' ) {
			savedMode = 'dozens';
		}
		return {
			mode: MODES.includes( savedMode ) ? savedMode : DEFAULT_SETTINGS.mode,
			hero: HEROES.some( ( option ) => option.value === saved.hero )
				? saved.hero
				: DEFAULT_SETTINGS.hero,
			heroTweaks: {
				tone: TONES.some( ( option ) => option.value === tweaks.tone )
					? tweaks.tone
					: DEFAULT_HERO_TWEAKS.tone,
				noiseStrength: savedNumber(
					tweaks.noiseStrength ?? tweaks.shaderStrength,
					0,
					100,
					DEFAULT_HERO_TWEAKS.noiseStrength
				),
				grainSize: savedNumber(
					tweaks.grainSize ?? tweaks.shaderScale,
					25,
					200,
					DEFAULT_HERO_TWEAKS.grainSize
				),
				hue: savedNumber( tweaks.hue, -180, 180, DEFAULT_HERO_TWEAKS.hue ),
				saturation: savedNumber( tweaks.saturation, 0, 200, DEFAULT_HERO_TWEAKS.saturation ),
				contrast: savedNumber( tweaks.contrast, 50, 150, DEFAULT_HERO_TWEAKS.contrast ),
				brightness: savedNumber( tweaks.brightness, 50, 150, DEFAULT_HERO_TWEAKS.brightness ),
				height: savedNumber( tweaks.height, 70, 130, DEFAULT_HERO_TWEAKS.height ),
				zoom: savedNumber( tweaks.zoom, 100, 170, DEFAULT_HERO_TWEAKS.zoom ),
				blur: savedNumber( tweaks.blur, 0, 40, DEFAULT_HERO_TWEAKS.blur ),
				fadeStart: savedNumber( tweaks.fadeStart, 0, 50, DEFAULT_HERO_TWEAKS.fadeStart ),
				fadeEnd: savedNumber( tweaks.fadeEnd, 60, 100, DEFAULT_HERO_TWEAKS.fadeEnd ),
			},
			x: Number.isFinite( saved.x )
				? clamp( saved.x, window.innerWidth - PANEL_WIDTH )
				: DEFAULT_SETTINGS.x,
			y: Number.isFinite( saved.y )
				? clamp( saved.y, window.innerHeight - 48 )
				: DEFAULT_SETTINGS.y,
			advanced: saved.advanced === true,
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
	return Array.from( { length: count }, ( _, index ): AmplifyReport => {
		const createdAt = new Date( Date.now() - index * 86_400_000 ).toISOString();
		return {
			id: `amplify-preview-${ index + 1 }`,
			status: 'completed',
			url: `https://sample-${ index + 1 }.example`,
			site_title: `Sample site ${ index + 1 }`,
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
			failure_reason: null,
		};
	} );
}

type NumericHeroTweak = Exclude< keyof AmplifyHeroTweaks, 'tone' >;

function HeroRange( {
	label,
	value,
	min,
	max,
	unit,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	unit: string;
	onChange: ( value: number ) => void;
} ) {
	return (
		<label className="dashboard-amplify-dev-controls__range">
			<span>
				{ label }{ ' ' }
				<output>
					{ value }
					{ unit }
				</output>
			</span>
			<input
				type="range"
				min={ min }
				max={ max }
				value={ value }
				onChange={ ( event ) => onChange( Number( event.target.value ) ) }
			/>
		</label>
	);
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
	const updateHeroValue = ( key: NumericHeroTweak, value: number ) =>
		onChange( ( previous ) => ( {
			...previous,
			heroTweaks: {
				...previous.heroTweaks,
				[ key ]: value,
				tone: [ 'hue', 'saturation', 'contrast', 'brightness' ].includes( key )
					? 'custom'
					: previous.heroTweaks.tone,
			},
		} ) );

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
					<legend>{ __( 'Hero image' ) }</legend>
					<div className="dashboard-amplify-dev-controls__choices">
						{ HEROES.map( ( option ) => (
							<label key={ option.value }>
								<input
									type="radio"
									name="amplify-dev-hero"
									value={ option.value }
									checked={ settings.hero === option.value }
									onChange={ () =>
										onChange( ( previous ) => ( { ...previous, hero: option.value } ) )
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
						} ) )
					}
				>
					{ __( 'Reset to live data' ) }
				</button>
				<details
					open={ settings.advanced }
					onToggle={ ( event ) => {
						// Read it now: the updater runs after React clears currentTarget.
						const isOpen = event.currentTarget.open;
						onChange( ( previous ) => ( { ...previous, advanced: isOpen } ) );
					} }
				>
					<summary>{ __( 'Advanced image tweaks' ) }</summary>
					<fieldset className="dashboard-amplify-dev-controls__image-group">
						<legend>{ __( 'Color' ) }</legend>
						<div className="dashboard-amplify-dev-controls__choices">
							{ TONES.map( ( option ) => (
								<label key={ option.value }>
									<input
										type="radio"
										name="amplify-dev-tone"
										value={ option.value }
										checked={ settings.heroTweaks.tone === option.value }
										onChange={ () =>
											onChange( ( previous ) => ( {
												...previous,
												heroTweaks: {
													...previous.heroTweaks,
													...( option.value === 'custom' ? {} : TONE_PRESETS[ option.value ] ),
													tone: option.value,
												},
											} ) )
										}
									/>
									{ option.label }
								</label>
							) ) }
						</div>
					</fieldset>
					<HeroRange
						label={ __( 'Noise intensity' ) }
						value={ settings.heroTweaks.noiseStrength }
						min={ 0 }
						max={ 100 }
						unit="%"
						onChange={ ( value ) => updateHeroValue( 'noiseStrength', value ) }
					/>
					<HeroRange
						label={ __( 'Grain size' ) }
						value={ settings.heroTweaks.grainSize }
						min={ 25 }
						max={ 200 }
						unit="%"
						onChange={ ( value ) => updateHeroValue( 'grainSize', value ) }
					/>
					{ (
						[
							[ 'hue', __( 'Hue' ), -180, 180, '°' ],
							[ 'saturation', __( 'Saturation' ), 0, 200, '%' ],
							[ 'contrast', __( 'Contrast' ), 50, 150, '%' ],
							[ 'brightness', __( 'Brightness' ), 50, 150, '%' ],
							[ 'height', __( 'Height' ), 70, 130, '%' ],
							[ 'zoom', __( 'Zoom' ), 100, 170, '%' ],
							[ 'blur', __( 'Fade blur' ), 0, 40, 'px' ],
							[ 'fadeStart', __( 'Fade starts' ), 0, 50, '%' ],
							[ 'fadeEnd', __( 'Fade ends' ), 60, 100, '%' ],
						] as [ NumericHeroTweak, string, number, number, string ][]
					 ).map( ( [ key, label, min, max, unit ] ) => (
						<HeroRange
							key={ key }
							label={ label }
							value={ settings.heroTweaks[ key ] }
							min={ min }
							max={ max }
							unit={ unit }
							onChange={ ( value ) => updateHeroValue( key, value ) }
						/>
					) ) }
					<button
						type="button"
						className="dashboard-amplify-dev-controls__reset"
						onClick={ () =>
							onChange( ( previous ) => ( {
								...previous,
								hero: DEFAULT_SETTINGS.hero,
								heroTweaks: DEFAULT_HERO_TWEAKS,
							} ) )
						}
					>
						{ __( 'Reset image' ) }
					</button>
				</details>
			</div>
		</aside>
	);
}
