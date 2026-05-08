import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import './audio-fft-blobs.scss';

const SHAPES = [
	'M 100 600 q 0 -500, 500 -500 t 500 500 t -500 500 T 100 600 z',
	'M 100 600 q -50 -400, 500 -500 t 450 550 t -500 500 T 100 600 z',
	'M 100 600 q 0 -400, 500 -500 t 400 500 t -500 500 T 100 600 z',
	'M 150 600 q 0 -600, 500 -500 t 500 550 t -500 500 T 150 600 z',
] as const;

const FFT_BANDS = [
	[ 60, 250 ],
	[ 250, 1000 ],
	[ 1000, 4000 ],
	[ 4000, 12000 ],
] as const;

type BandValues = readonly [ number, number, number, number ];

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
	bands?: Partial< BandValues >;
	className?: string;
	isActive?: boolean;
	size?: number;
}

type BlobStyle = CSSProperties & Record< `--fft-band-${ 1 | 2 | 3 | 4 }`, string >;

export function AudioFftBlobs( {
	stream = null,
	bands,
	className,
	isActive = true,
	size = 160,
}: AudioFftBlobsProps ) {
	const controlledBands = useMemo< BandValues >(
		() => [
			normalizeBand( bands?.[ 0 ] ),
			normalizeBand( bands?.[ 1 ] ),
			normalizeBand( bands?.[ 2 ] ),
			normalizeBand( bands?.[ 3 ] ),
		],
		[ bands ]
	);
	const [ fftBands, setFftBands ] = useState< BandValues >( controlledBands );

	useEffect( () => {
		if ( isActive ) {
			return;
		}
		setFftBands( [ 0, 0, 0, 0 ] );
	}, [ isActive ] );

	useEffect( () => {
		if ( stream ) {
			return;
		}
		setFftBands( controlledBands );
	}, [ controlledBands, stream ] );

	useEffect( () => {
		if ( ! stream || ! isActive ) {
			return;
		}

		const AudioContextCtor =
			window.AudioContext ||
			( window as Window & { webkitAudioContext?: typeof AudioContext } ).webkitAudioContext;
		if ( ! AudioContextCtor ) {
			return;
		}

		const audioContext = new AudioContextCtor();
		const source = audioContext.createMediaStreamSource( stream );
		const analyser = audioContext.createAnalyser();
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = 0.82;
		source.connect( analyser );

		const frequencyData = new Uint8Array( analyser.frequencyBinCount );
		let frameId = 0;

		const tick = () => {
			analyser.getByteFrequencyData( frequencyData );
			setFftBands( readBands( frequencyData, audioContext.sampleRate ) );
			frameId = window.requestAnimationFrame( tick );
		};

		void audioContext.resume();
		tick();

		return () => {
			window.cancelAnimationFrame( frameId );
			source.disconnect();
			analyser.disconnect();
			void audioContext.close();
		};
	}, [ isActive, stream ] );

	const style: BlobStyle = {
		width: size,
		height: size,
		'--fft-band-1': String( fftBands[ 0 ] ),
		'--fft-band-2': String( fftBands[ 1 ] ),
		'--fft-band-3': String( fftBands[ 2 ] ),
		'--fft-band-4': String( fftBands[ 3 ] ),
	};

	return (
		<div
			className={ clsx( 'audio-fft-blobs', className, {
				'is-active': isActive,
			} ) }
			style={ style }
			aria-hidden="true"
		>
			<svg viewBox="0 0 1200 1200" focusable="false">
				{ SHAPES.map( ( shape, index ) => {
					const band = index + 1;
					return (
						<g
							className={ `audio-fft-blobs__blob audio-fft-blobs__blob-${ band }` }
							key={ `blob-${ band }` }
						>
							<path d={ shape } />
						</g>
					);
				} ) }
				{ SHAPES.map( ( shape, index ) => {
					const band = index + 1;
					return (
						<g
							className={ `audio-fft-blobs__blob audio-fft-blobs__blob-${ band } audio-fft-blobs__blob--alt` }
							key={ `blob-${ band }-alt` }
						>
							<path d={ shape } />
						</g>
					);
				} ) }
			</svg>
		</div>
	);
}

export default AudioFftBlobs;

function normalizeBand( value: unknown ): number {
	return typeof value === 'number' && Number.isFinite( value )
		? Math.max( 0, Math.min( 1, value ) )
		: 0;
}

function readBands( frequencyData: Uint8Array, sampleRate: number ): BandValues {
	const nyquist = sampleRate / 2;

	const bandValues = FFT_BANDS.map( ( [ minHz, maxHz ] ) => {
		const start = Math.max( 0, Math.floor( ( minHz / nyquist ) * frequencyData.length ) );
		const end = Math.min(
			frequencyData.length - 1,
			Math.ceil( ( Math.min( maxHz, nyquist ) / nyquist ) * frequencyData.length )
		);

		let sum = 0;
		let count = 0;
		for ( let i = start; i <= end; i++ ) {
			sum += frequencyData[ i ];
			count++;
		}

		const average = count ? sum / count / 255 : 0;
		return Math.max( 0, Math.min( 1, ( average - 0.04 ) * 1.8 ) );
	} );

	return [ bandValues[ 0 ] ?? 0, bandValues[ 1 ] ?? 0, bandValues[ 2 ] ?? 0, bandValues[ 3 ] ?? 0 ];
}
