import { Text, Timegroup } from '@editframe/react';
import type { FeatureClipBrief } from './types';

// EFImage rewrites every non-data: src to ${apiHost}/api/v1/assets/image?src=...,
// which we don't host. Until we add that proxy endpoint, render scenes with a
// plain <img crossOrigin="anonymous"> so we can validate the rest of the
// pipeline. Image must be CORS-enabled (wpcomstaging uploads currently are).

const INFORMATIVE_SCENE_DURATION_MS = 3000;
const INFORMATIVE_TITLE_CARD_DURATION_MS = 3000;
const TRANSITION_OVERLAP_MS = 400;

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
	const totalMs =
		scenes.length * INFORMATIVE_SCENE_DURATION_MS +
		INFORMATIVE_TITLE_CARD_DURATION_MS -
		Math.max( 0, scenes.length ) * TRANSITION_OVERLAP_MS;

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
				if ( audioBed !== 'silent' ) {
					installAudioBed( element as SyntheticAudioTimegroup, audioBed );
				}
				installSceneProgressDriver( element as FrameTaskTimegroup );
			} }
		>
			<Timegroup mode="sequence" overlapMs={ TRANSITION_OVERLAP_MS } className="timeline-sequence">
				{ scenes.map( ( scene, index ) => (
					<Timegroup
						key={ `${ scene.imageUrl }-${ index }` }
						mode="fixed"
						duration={ `${ INFORMATIVE_SCENE_DURATION_MS }ms` }
						className="scene scene-image"
					>
						<div className={ `scene-background-frame camera-${ scene.camera }` }>
							<img
								src={ scene.imageUrl }
								crossOrigin="anonymous"
								className="scene-background"
								alt=""
							/>
						</div>
						<div className="scene-image-overlay" />
						{ scene.caption ? (
							<Text duration={ `${ INFORMATIVE_SCENE_DURATION_MS }ms` } className="scene-caption">
								{ scene.caption }
							</Text>
						) : null }
					</Timegroup>
				) ) }

				<Timegroup
					mode="fixed"
					duration={ `${ INFORMATIVE_TITLE_CARD_DURATION_MS }ms` }
					className="scene scene-title-card"
				>
					<div className="scene-grid">
						<div className="scene-copy">
							<Text
								split="word"
								duration={ `${ INFORMATIVE_TITLE_CARD_DURATION_MS }ms` }
								className="scene-title"
							>
								{ brief.titleCard.copy }
							</Text>
						</div>
					</div>
				</Timegroup>
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

// Synthesized procedural audio bed lifted from the spike. Fine for
// internal-only previews; replace with a real asset before public ship.
function installAudioBed(
	timegroup: SyntheticAudioTimegroup,
	mood: 'contemplative' | 'energetic'
) {
	const chords =
		mood === 'energetic'
			? [
					[ 174.61, 261.63, 349.23 ],
					[ 196.0, 293.66, 392.0 ],
					[ 220.0, 329.63, 440.0 ],
					[ 196.0, 293.66, 392.0 ],
			  ]
			: [
					[ 146.83, 220.0, 293.66 ],
					[ 164.81, 246.94, 329.63 ],
					[ 130.81, 196.0, 261.63 ],
					[ 174.61, 261.63, 349.23 ],
			  ];

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
				const chord = chords[ Math.floor( t / 3.75 ) % chords.length ];
				const swell = 0.55 + 0.45 * Math.sin( 2 * Math.PI * 0.05 * t );
				const pad =
					chord.reduce( ( sum, freq, idx ) => {
						const detune = idx === 1 ? 0.997 : 1.003;
						return (
							sum +
							Math.sin( 2 * Math.PI * freq * t ) * 0.045 +
							Math.sin( 2 * Math.PI * freq * detune * t ) * 0.03
						);
					}, 0 ) * swell;
				const beatTime = t % 1.5;
				const kick = Math.exp( -beatTime * 9 ) * Math.sin( 2 * Math.PI * 70 * t ) * 0.16;
				const pan = channel === 0 ? 0.94 : 0.86;
				data[ i ] = Math.max( -0.95, Math.min( 0.95, ( pad + kick ) * pan ) );
			}
		}

		return buffer;
	};
}
