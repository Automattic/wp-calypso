import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import './audio-fft-blobs.scss';

const DEFAULT_SIZE = 64;
const BAR_WIDTH = 3;
const BAR_GAP = 1;
const BAR_COUNT = 16;
const MIN_BAR_HEIGHT = 4;
const NOISE_FLOOR = 0.015;
const PEAK_FLOOR = 0.08;
const PEAK_ATTACK = 0.54;
const PEAK_RELEASE = 0.012;
const LEVEL_ATTACK = 0.32;
const LEVEL_RELEASE = 0.16;
const VISUAL_GAIN = 1.7;
const TRAIL_ERASE_ALPHA = 0.34;

interface AudioFftBlobsProps {
	/**
	 * Microphone or audio stream to analyze. When omitted, the component uses
	 * the `bands` prop and can still render as a controlled visualization.
	 */
	stream?: MediaStream | null;
	/**
	 * Controlled band amplitudes from 0 to 1. Used as fallback when `stream`
	 * is not provided.
	 */
	bands?: readonly number[];
	className?: string;
	isActive?: boolean;
	size?: number;
}

export function AudioFftBlobs( {
	stream = null,
	bands,
	className,
	isActive = true,
	size = DEFAULT_SIZE,
}: AudioFftBlobsProps ) {
	const canvasRef = useRef< HTMLCanvasElement | null >( null );
	const bandsRef = useRef< readonly number[] | undefined >( bands );

	useEffect( () => {
		bandsRef.current = bands;
	}, [ bands ] );

	useEffect( () => {
		const canvas = canvasRef.current;
		if ( ! canvas ) {
			return;
		}

		let frameId = 0;
		let audioContext: AudioContext | null = null;
		let source: MediaStreamAudioSourceNode | null = null;
		let analyser: AnalyserNode | null = null;
		let timeDomainData: Uint8Array< ArrayBuffer > | null = null;
		let lastValues = Array.from( { length: BAR_COUNT }, () => 0 );
		let adaptivePeak = PEAK_FLOOR;

		const drawFrame = () => {
			const nextValues =
				stream && isActive && analyser && timeDomainData
					? readWaveformBars( analyser, timeDomainData )
					: readControlledBars( bandsRef.current, isActive );
			const normalizedValues = normalizeBarsToAdaptivePeak( nextValues, adaptivePeak );
			adaptivePeak = normalizedValues.peak;

			lastValues = lastValues.map( ( value, index ) => {
				const smoothing = normalizedValues.values[ index ] > value ? LEVEL_ATTACK : LEVEL_RELEASE;
				return value * ( 1 - smoothing ) + normalizedValues.values[ index ] * smoothing;
			} );
			drawWaveform( canvas, lastValues, size );
			frameId = window.requestAnimationFrame( drawFrame );
		};

		const start = async () => {
			if ( stream && isActive ) {
				const AudioContextCtor =
					window.AudioContext ||
					( window as Window & { webkitAudioContext?: typeof AudioContext } ).webkitAudioContext;

				if ( AudioContextCtor ) {
					audioContext = new AudioContextCtor();
					source = audioContext.createMediaStreamSource( stream );
					analyser = audioContext.createAnalyser();
					analyser.fftSize = 512;
					analyser.smoothingTimeConstant = 0.74;
					source.connect( analyser );
					timeDomainData = new Uint8Array( analyser.fftSize );
					await audioContext.resume();
				}
			}

			drawFrame();
		};

		void start();

		return () => {
			window.cancelAnimationFrame( frameId );
			source?.disconnect();
			analyser?.disconnect();
			void audioContext?.close();
		};
	}, [ isActive, size, stream ] );

	return (
		<div
			className={ clsx( 'audio-fft-blobs', className, {
				'is-active': isActive,
			} ) }
			style={ { width: size, height: size } }
			aria-hidden="true"
		>
			<canvas ref={ canvasRef } width={ size } height={ size } />
		</div>
	);
}

export default AudioFftBlobs;

function readWaveformBars(
	analyser: AnalyserNode,
	timeDomainData: Uint8Array< ArrayBuffer >
): number[] {
	analyser.getByteTimeDomainData( timeDomainData );

	const samplesPerBar = Math.floor( timeDomainData.length / BAR_COUNT );
	return Array.from( { length: BAR_COUNT }, ( _, index ) => {
		const start = index * samplesPerBar;
		const end = Math.min( timeDomainData.length, start + samplesPerBar );
		let sum = 0;
		let count = 0;

		for ( let i = start; i < end; i++ ) {
			sum += Math.abs( timeDomainData[ i ] - 128 ) / 128;
			count++;
		}

		return Math.max( 0, count ? sum / count : 0 );
	} );
}

function readControlledBars( bands: readonly number[] | undefined, isActive: boolean ): number[] {
	if ( ! isActive ) {
		return Array.from( { length: BAR_COUNT }, () => 0 );
	}
	if ( ! bands?.length ) {
		return Array.from( { length: BAR_COUNT }, () => 0 );
	}

	return Array.from( { length: BAR_COUNT }, ( _, index ) =>
		Math.max( 0, bands[ Math.floor( ( index / BAR_COUNT ) * bands.length ) ] ?? 0 )
	);
}

function normalizeBarsToAdaptivePeak(
	values: number[],
	previousPeak: number
): { values: number[]; peak: number } {
	const currentPeak = values.reduce( ( peak, value ) => Math.max( peak, value ), 0 );
	const nextPeak = Math.max(
		PEAK_FLOOR,
		previousPeak +
			( currentPeak - previousPeak ) * ( currentPeak > previousPeak ? PEAK_ATTACK : PEAK_RELEASE )
	);

	return {
		peak: nextPeak,
		values: values.map( ( value ) => {
			const denoised = value <= NOISE_FLOOR ? 0 : value - NOISE_FLOOR;
			return Math.max( 0, Math.min( 1, ( denoised / nextPeak ) * VISUAL_GAIN ) );
		} ),
	};
}

function drawWaveform( canvas: HTMLCanvasElement, values: number[], size: number ) {
	const pixelRatio = window.devicePixelRatio || 1;
	const width = Math.round( size * pixelRatio );
	const height = Math.round( size * pixelRatio );

	if ( canvas.width !== width || canvas.height !== height ) {
		canvas.width = width;
		canvas.height = height;
	}

	const ctx = canvas.getContext( '2d' );
	if ( ! ctx ) {
		return;
	}

	ctx.save();
	ctx.scale( pixelRatio, pixelRatio );
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = `rgba( 0, 0, 0, ${ TRAIL_ERASE_ALPHA } )`;
	ctx.fillRect( 0, 0, size, size );
	ctx.globalCompositeOperation = 'source-over';

	const gradient = ctx.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop( 0, '#3858e9' );
	gradient.addColorStop( 1, '#183ad6' );
	ctx.fillStyle = gradient;

	const totalBarsWidth = BAR_COUNT * BAR_WIDTH + ( BAR_COUNT - 1 ) * BAR_GAP;
	const startX = ( size - totalBarsWidth ) / 2;
	const maxBarHeight = size - 18;

	values.forEach( ( value, index ) => {
		const barHeight = MIN_BAR_HEIGHT + value * maxBarHeight;
		const x = startX + index * ( BAR_WIDTH + BAR_GAP );
		const y = ( size - barHeight ) / 2;
		drawRoundedBar( ctx, x, y, BAR_WIDTH, barHeight );
	} );

	ctx.restore();
}

function drawRoundedBar(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number
) {
	const radius = width / 2;

	ctx.beginPath();
	if ( typeof ctx.roundRect === 'function' ) {
		ctx.roundRect( x, y, width, height, radius );
	} else {
		ctx.moveTo( x + radius, y );
		ctx.lineTo( x + width - radius, y );
		ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
		ctx.lineTo( x + width, y + height - radius );
		ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
		ctx.lineTo( x + radius, y + height );
		ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
		ctx.lineTo( x, y + radius );
		ctx.quadraticCurveTo( x, y, x + radius, y );
	}
	ctx.fill();
}
