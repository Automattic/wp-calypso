import { Image as EFImage, Timegroup } from '@editframe/react';
import type { FeatureClipBrief } from './types';

const INFORMATIVE_SCENE_DURATION_MS = 4000;
// Cycled through text scenes so consecutive ones don't share a gradient.
const TEXT_SCENE_ACCENTS = [ 'indigo', 'teal', 'amber', 'rose' ] as const;
const INFORMATIVE_TITLE_CARD_DURATION_MS = 3000;
// Text-only fallback (no usable scene images): single, longer title card so the
// clip still feels intentional rather than ending after 3 s.
const TEXT_ONLY_TITLE_CARD_DURATION_MS = 6000;
// Longer crossfade between scenes so the captured frames blend more
// gradually — short overlaps look like hard cuts in the rendered MP4.
const TRANSITION_OVERLAP_MS = 700;

interface SyntheticAudioTimegroup extends HTMLElement {
	renderAudio: ( fromMs: number, toMs: number, signal?: AbortSignal ) => Promise< AudioBuffer >;
}

interface FrameTaskTimegroup extends SyntheticAudioTimegroup {
	addFrameTask: (
		callback: ( info: { currentTimeMs: number } ) => void | Promise< void >
	) => () => void;
	currentTimeMs: number;
	initializer?: ( instance: FrameTaskTimegroup ) => void;
	__sceneProgressInstalled?: boolean;
}

interface InformativeFeatureClipProps {
	id: string;
	brief: FeatureClipBrief;
}

/**
 * Informative renderer: slow pacing, longer-held shots, restrained
 * typography. Ken-Burns is subtle. Suitable for news, explainers, recipes,
 * profiles. Audio bed defaults to contemplative when present.
 */
export function InformativeFeatureClip( { id, brief }: InformativeFeatureClipProps ) {
	const scenes = brief.scenes;
	const isTextOnly = scenes.length === 0;
	const titleCardDurationMs = isTextOnly
		? TEXT_ONLY_TITLE_CARD_DURATION_MS
		: INFORMATIVE_TITLE_CARD_DURATION_MS;
	const totalMs = isTextOnly
		? titleCardDurationMs
		: scenes.length * INFORMATIVE_SCENE_DURATION_MS +
		  titleCardDurationMs -
		  scenes.length * TRANSITION_OVERLAP_MS;

	const audioBed = brief.audioBed ?? 'silent';

	return (
		<Timegroup
			id={ id }
			mode="fixed"
			duration={ `${ Math.max( totalMs, 1000 ) }ms` }
			className="image-studio-feature-clip image-studio-feature-clip--informative composition-root"
			ref={ ( element: HTMLElement | null ) => {
				if ( ! element ) {
					return;
				}
				// Force size on the host element directly + global !important
				// rule in style.scss. We have a defense in depth here because
				// the Lit custom-element upgrade timing was leaving
				// offsetWidth/Height at 0 when EditFrame's renderer first
				// measured the host.
				element.style.setProperty( 'display', 'block', 'important' );
				element.style.setProperty( 'width', '1080px', 'important' );
				element.style.setProperty( 'height', '1920px', 'important' );
				element.style.setProperty( 'position', 'relative', 'important' );
				// Force a layout flush.
				// eslint-disable-next-line no-unused-expressions
				element.offsetHeight;

				if ( audioBed !== 'silent' ) {
					installAudioBed( element as SyntheticAudioTimegroup, audioBed );
				}
				installSceneProgressDriver( element as FrameTaskTimegroup );

				const rect = element.getBoundingClientRect();
				const computed = typeof window !== 'undefined' ? window.getComputedStyle( element ) : null;
				// eslint-disable-next-line no-console
				console.log( '[InformativeFeatureClip] composition-root measured:', {
					offsetWidth: element.offsetWidth,
					offsetHeight: element.offsetHeight,
					rectWidth: rect.width,
					rectHeight: rect.height,
					computedDisplay: computed?.display,
					computedWidth: computed?.width,
					computedHeight: computed?.height,
					parentDisplay:
						element.parentElement &&
						typeof window !== 'undefined' &&
						window.getComputedStyle( element.parentElement ).display,
					isConnected: element.isConnected,
				} );
			} }
		>
			<Timegroup mode="sequence" overlapMs={ TRANSITION_OVERLAP_MS } className="timeline-sequence">
				{ scenes.map( ( scene, index ) => {
					const hasImage = !! scene.imageUrl;
					const hasText = !! scene.text;
					const sceneKey = `${ scene.imageUrl ?? 'text' }-${ index }`;
					const accent = TEXT_SCENE_ACCENTS[ index % TEXT_SCENE_ACCENTS.length ];
					const sceneClass = [
						'scene',
						hasImage ? 'scene-image' : `scene-text-overlay scene-text-overlay--${ accent }`,
						hasText ? 'scene-has-text' : null,
					]
						.filter( Boolean )
						.join( ' ' );
					return (
						<Timegroup
							key={ sceneKey }
							mode="fixed"
							duration={ `${ INFORMATIVE_SCENE_DURATION_MS }ms` }
							className={ sceneClass }
						>
							{ hasImage ? (
								<>
									<div className={ `scene-background-frame camera-${ scene.camera }` }>
										<EFImage src={ scene.imageUrl as string } className="scene-background" />
									</div>
									<div className="scene-image-overlay" />
								</>
							) : null }
							{ hasText ? (
								<div
									className={
										hasImage
											? 'scene-text-overlay-frame scene-text-overlay-frame--on-image'
											: `scene-text-overlay-frame camera-${ scene.camera }`
									}
								>
									{ hasImage ? (
										<div className="scene-text-overlay-frame__scrim" aria-hidden />
									) : null }
									<div className="scene-grid">
										<div className="scene-copy">
											{ scene.eyebrow ? (
												<span className="scene-text-overlay__eyebrow">{ scene.eyebrow }</span>
											) : null }
											{ /*
												Plain span — NOT <Text split="word">. EditFrame's
												frame-by-frame snapshot doesn't render JS/RAF
												animations smoothly; only animations driven by the
												per-frame `--scene-progress` CSS var capture cleanly.
												Opacity + translate tween in CSS off that var.
											*/ }
											<span className="scene-text-overlay__body">{ scene.text as string }</span>
										</div>
									</div>
								</div>
							) : null }
							{ scene.caption && ! hasText ? (
								<span className="scene-caption">{ scene.caption }</span>
							) : null }
						</Timegroup>
					);
				} ) }

				{ ( () => {
					// Reuse a scene image as the title card backdrop when available
					// — keeps visual consistency through the closer instead of
					// dropping to a bare gradient. Fall back to text-only gradient
					// if no scene has an image (Highlights flow without images).
					const titleCardImage = scenes.find( ( s ) => !! s.imageUrl )?.imageUrl ?? null;
					let titleCardClass: string;
					if ( isTextOnly ) {
						titleCardClass = 'scene scene-title-card scene-title-card--text-only camera-zoom-in';
					} else if ( titleCardImage ) {
						titleCardClass = 'scene scene-title-card scene-title-card--on-image camera-zoom-in';
					} else {
						titleCardClass = 'scene scene-title-card';
					}
					return (
						<Timegroup
							mode="fixed"
							duration={ `${ titleCardDurationMs }ms` }
							className={ titleCardClass }
						>
							{ titleCardImage ? (
								<>
									<div className="scene-background-frame camera-zoom-in">
										<EFImage src={ titleCardImage } className="scene-background" />
									</div>
									<div className="scene-image-overlay" />
									<div className="scene-text-overlay-frame__scrim" aria-hidden />
								</>
							) : null }
							<div className="scene-grid">
								<div className="scene-copy">
									<span className="scene-title">{ brief.titleCard.copy }</span>
								</div>
							</div>
						</Timegroup>
					);
				} )() }
			</Timegroup>
		</Timegroup>
	);
}

// Drives `--scene-progress` (0..1) on each .scene element each frame for
// the camera-N CSS transforms (Ken-Burns) and other progress-driven CSS.
function installSceneProgressDriver( timegroup: FrameTaskTimegroup ) {
	const initializer = ( instance: FrameTaskTimegroup ) => {
		if ( instance.__sceneProgressInstalled || ! instance.addFrameTask ) {
			return;
		}
		instance.__sceneProgressInstalled = true;
		updateSceneProgress( instance, instance.currentTimeMs ?? 0 );
		instance.addFrameTask( ( { currentTimeMs } ) => {
			updateSceneProgress( instance, currentTimeMs );
		} );
	};
	timegroup.initializer = initializer;
	initializer( timegroup );
}

function updateSceneProgress( root: HTMLElement, currentTimeMs: number ) {
	const scenes = Array.from(
		root.querySelectorAll< HTMLElement >( '.timeline-sequence > .scene' )
	);
	scenes.forEach( ( scene ) => {
		const startTimeMs = readNumberProperty( scene, 'startTimeMs', 0 );
		const durationMs = readNumberProperty( scene, 'durationMs', 3000 );
		const progress =
			durationMs <= 0
				? 1
				: Math.max( 0, Math.min( 1, ( currentTimeMs - startTimeMs ) / durationMs ) );
		scene.style.setProperty( '--scene-progress', progress.toFixed( 5 ) );
	} );
}

function readNumberProperty( element: HTMLElement, property: string, fallback: number ) {
	const value = ( element as unknown as Record< string, unknown > )[ property ];
	return typeof value === 'number' && Number.isFinite( value ) ? value : fallback;
}

// Synthesized procedural audio bed lifted from the spike and expanded.
// Pad + bass + sparse melody + varied kick pattern. Long enough chord
// progressions (8 chords, 32 s before repeat) and rotating kick patterns
// so a 24 s clip doesn't loop back on itself audibly.
//
// Still synth — replace with real audio assets before public ship.

interface MoodProfile {
	chords: number[][]; // triad frequencies (Hz)
	chordDurationS: number;
	melodyScale: number[]; // pentatonic scale notes (Hz)
	melodyStepS: number; // duration of one melody slot
	melodyAmp: number;
	melodyDensity: number; // 0..1, fraction of slots that get a note
	bassAmp: number;
	kickPatterns: number[][]; // 8-step velocity arrays cycled through
	kickStepS: number;
	kickAmp: number;
	padAmp: number;
	swellHz: number; // amplitude swell rate
}

const MOOD_PROFILES: Record< 'contemplative' | 'energetic', MoodProfile > = {
	contemplative: {
		// 8-chord A-B progression: D-E-C-F | D-G-Am-F. ~32 s before repeat.
		chords: [
			[ 146.83, 220.0, 293.66 ], // D minor
			[ 164.81, 246.94, 329.63 ], // E minor
			[ 130.81, 196.0, 261.63 ], // C major
			[ 174.61, 261.63, 349.23 ], // F major
			[ 146.83, 220.0, 293.66 ], // D minor
			[ 196.0, 293.66, 392.0 ], // G major
			[ 110.0, 164.81, 220.0 ], // A minor (lower)
			[ 174.61, 261.63, 349.23 ], // F major
		],
		chordDurationS: 4.0,
		// D minor pentatonic, 1 octave above triad roots
		melodyScale: [ 293.66, 349.23, 392.0, 440.0, 523.25 ],
		melodyStepS: 0.75,
		melodyAmp: 0.07,
		melodyDensity: 0.45,
		bassAmp: 0.14,
		kickPatterns: [
			[ 1, 0, 0, 0, 0.7, 0, 0, 0 ], // sparse downbeat
			[ 1, 0, 0.5, 0, 0.7, 0, 0.4, 0 ], // light fill
			[ 1, 0, 0, 0, 0.7, 0, 0, 0.5 ], // back-pickup
			[ 0.6, 0, 0, 0, 0.5, 0, 0, 0 ], // breathy
		],
		kickStepS: 0.5,
		kickAmp: 0.18,
		padAmp: 0.045,
		swellHz: 0.05,
	},
	energetic: {
		// F-G-Am-G | F-Bb-C-G; brighter major motion
		chords: [
			[ 174.61, 261.63, 349.23 ], // F major
			[ 196.0, 293.66, 392.0 ], // G major
			[ 220.0, 261.63, 329.63 ], // A minor
			[ 196.0, 293.66, 392.0 ], // G major
			[ 174.61, 261.63, 349.23 ], // F major
			[ 233.08, 293.66, 349.23 ], // Bb major
			[ 261.63, 329.63, 392.0 ], // C major (high)
			[ 196.0, 293.66, 392.0 ], // G major
		],
		chordDurationS: 3.0,
		// F major pentatonic
		melodyScale: [ 349.23, 392.0, 440.0, 523.25, 587.33 ],
		melodyStepS: 0.5,
		melodyAmp: 0.085,
		melodyDensity: 0.62,
		bassAmp: 0.16,
		kickPatterns: [
			[ 1, 0, 0.5, 0, 1, 0, 0.5, 0 ], // four-on-the-floor
			[ 1, 0, 0.5, 0.4, 1, 0, 0.5, 0.6 ], // double-time fill
			[ 1, 0, 0.6, 0, 0.9, 0.4, 0.5, 0 ], // syncopated
			[ 1, 0, 0.5, 0, 1, 0, 0.5, 0.7 ], // big back-pickup
		],
		kickStepS: 0.375,
		kickAmp: 0.22,
		padAmp: 0.04,
		swellHz: 0.07,
	},
};

// Deterministic pseudo-random in [0, 1) — keyed on an integer slot index so
// the same clip rendered twice produces identical audio. Avoids needing a
// seedable PRNG.
function slotRandom( seed: number ): number {
	const x = Math.sin( seed * 12.9898 + 78.233 ) * 43758.5453;
	return x - Math.floor( x );
}

function installAudioBed(
	timegroup: SyntheticAudioTimegroup,
	mood: 'contemplative' | 'energetic'
) {
	const profile = MOOD_PROFILES[ mood ];

	timegroup.renderAudio = async ( fromMs, toMs, signal ) => {
		signal?.throwIfAborted();
		const sampleRate = 48_000;
		const length = Math.max( 1, Math.ceil( ( ( toMs - fromMs ) / 1000 ) * sampleRate ) );
		const context = new OfflineAudioContext( 2, length, sampleRate );
		const buffer = context.createBuffer( 2, length, sampleRate );

		for ( let channel = 0; channel < buffer.numberOfChannels; channel += 1 ) {
			const data = buffer.getChannelData( channel );
			for ( let i = 0; i < data.length; i += 1 ) {
				const t = fromMs / 1000 + i / sampleRate;

				// Pad layer (the harmonic bed): cycled chord, slow amplitude swell.
				const chord =
					profile.chords[ Math.floor( t / profile.chordDurationS ) % profile.chords.length ];
				const swell = 0.55 + 0.45 * Math.sin( 2 * Math.PI * profile.swellHz * t );
				const pad =
					chord.reduce( ( sum, freq, idx ) => {
						const detune = idx === 1 ? 0.997 : 1.003;
						return (
							sum +
							Math.sin( 2 * Math.PI * freq * t ) * profile.padAmp +
							Math.sin( 2 * Math.PI * freq * detune * t ) * ( profile.padAmp * 0.66 )
						);
					}, 0 ) * swell;

				// Bass: chord root one octave down with a slow envelope per chord
				// so each chord change has a soft attack-release shape.
				const bassFreq = chord[ 0 ] * 0.5;
				const chordPhase = ( t % profile.chordDurationS ) / profile.chordDurationS;
				const bassEnv = Math.sin( Math.PI * chordPhase ) ** 0.7;
				const bass = Math.sin( 2 * Math.PI * bassFreq * t ) * profile.bassAmp * bassEnv;

				// Melody: deterministic sparse top-line picked per slot. Notes
				// have a short attack-decay envelope so they feel like plucks.
				const slot = Math.floor( t / profile.melodyStepS );
				const slotPhase = ( t % profile.melodyStepS ) / profile.melodyStepS;
				const slotPlays = slotRandom( slot * 17 + 1 ) < profile.melodyDensity;
				let melody = 0;
				if ( slotPlays ) {
					const noteIdx = Math.floor( slotRandom( slot * 31 + 7 ) * profile.melodyScale.length );
					const noteFreq = profile.melodyScale[ noteIdx ];
					// Bell-like: fast attack, exponential decay.
					const env = slotPhase < 0.05 ? slotPhase / 0.05 : Math.exp( -( slotPhase - 0.05 ) * 4.5 );
					melody =
						( Math.sin( 2 * Math.PI * noteFreq * t ) * 0.7 +
							Math.sin( 2 * Math.PI * noteFreq * 2 * t ) * 0.25 ) *
						env *
						profile.melodyAmp;
				}

				// Kick: 8-step pattern, pattern rotates every 4 bars (32 steps).
				const kickStep = Math.floor( t / profile.kickStepS );
				const kickPhase = ( t % profile.kickStepS ) / profile.kickStepS;
				const patternIdx = Math.floor( kickStep / 8 ) % profile.kickPatterns.length;
				const stepInPattern = kickStep % 8;
				const kickVel = profile.kickPatterns[ patternIdx ][ stepInPattern ];
				const kickEnv = Math.exp( -kickPhase * 9 );
				const kick = Math.sin( 2 * Math.PI * 70 * t ) * kickEnv * profile.kickAmp * kickVel;

				// Mix + soft stereo bias + clip.
				const mix = pad + bass + melody + kick;
				const pan = channel === 0 ? 0.94 : 0.86;
				data[ i ] = Math.max( -0.95, Math.min( 0.95, mix * pan ) );
			}
		}

		return buffer;
	};
}
