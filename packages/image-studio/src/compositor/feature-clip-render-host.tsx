import { Configuration, Preview, TimelineRoot } from '@editframe/react';
import { dispatch as wpDispatch, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore, type ImageStudioActions } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import {
	trackFeatureClipRenderCompleted,
	trackFeatureClipRenderStarted,
	trackImageStudioError,
	trackImageStudioImageGenerated,
} from '../utils/tracking';
import { COMPOSITION_ID, FeatureClipVideo } from './feature-clip-video';
import { uploadFeatureClipBlob } from './upload-feature-clip';
import type { FeatureClipBrief } from './types';

const RENDER_OPTIONS = {
	fps: 30,
	codec: 'avc' as const,
	bitrate: 7_000_000,
	includeAudio: true,
	audioBitrate: 160_000,
	contentReadyMode: 'blocking' as const,
	blockingTimeoutMs: 15_000,
	returnBuffer: true,
	streaming: false,
};

interface RenderToVideoTimegroup extends HTMLElement {
	renderToVideo: ( options: Record< string, unknown > ) => Promise< unknown >;
}

/**
 * EditFrame's <EFImage> hard-codes a rewrite of any non-data: src to
 * `${apiHost}/api/v1/assets/image?src=...` (its asset-proxy endpoint). We
 * don't run an EditFrame backend, so that path 404s. The only short-circuit
 * in EFImage is `src.startsWith("data:")`, so we prefetch each scene image
 * here and inline it as a data URL.
 */
async function imageUrlToDataUrl( url: string ): Promise< string > {
	const response = await fetch( url, { credentials: 'omit' } );
	if ( ! response.ok ) {
		throw new Error( `Failed to fetch scene image (${ response.status }): ${ url }` );
	}
	const blob = await response.blob();
	return await new Promise< string >( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => resolve( String( reader.result ) );
		reader.onerror = () => reject( new Error( `FileReader failed for ${ url }` ) );
		reader.readAsDataURL( blob );
	} );
}

async function resolveBriefImages( brief: FeatureClipBrief ): Promise< FeatureClipBrief > {
	const resolvedScenes = await Promise.all(
		brief.scenes.map( async ( scene ) => {
			if ( scene.imageUrl.startsWith( 'data:' ) ) {
				return scene;
			}
			const dataUrl = await imageUrlToDataUrl( scene.imageUrl );
			return { ...scene, imageUrl: dataUrl };
		} )
	);
	return { ...brief, scenes: resolvedScenes };
}

/**
 * Always-mounted host that owns the browser-side render lifecycle for the
 * "feature clip from photos" path.
 *
 * Watches `videoStudioStore.pendingRender`; when a request appears, mounts
 * the EditFrame compositor in an off-screen container, runs renderToVideo,
 * uploads the resulting MP4 to the Media Library, and writes the result
 * back to the store.
 *
 * This component lives OUTSIDE the Image Studio modal so closing the
 * modal mid-render doesn't unmount the compositor. The modal and the
 * sidebar widget both observe the same store slots — they're consumers,
 * not owners.
 */
export function FeatureClipRenderHost() {
	const pendingRender = useSelect(
		( select ) => select( videoStudioStore ).getPendingFeatureClipRender(),
		[]
	);
	const isCancelling = useSelect(
		( select ) => select( videoStudioStore ).getFeatureClipIsCancelling(),
		[]
	);

	const {
		setFeatureClipProgressPhase,
		completeFeatureClipRender,
		failFeatureClipRender,
		clearFeatureClipPending,
	} = useDispatch( videoStudioStore ) as unknown as VideoStudioActions;

	const [ mountedRequestId, setMountedRequestId ] = useState< string | null >( null );
	const [ resolvedBrief, setResolvedBrief ] = useState< {
		requestId: string;
		brief: FeatureClipBrief;
	} | null >( null );

	// Track which requestId we've already kicked off a prefetch for. Using a
	// ref (not deps) means dep instability from useDispatch / store re-renders
	// doesn't restart prefetch mid-flight — and the catch path never gets
	// stranded without dispatching failFeatureClipRender, which was hanging the
	// orchestrator on "Tool calls without results."
	const prefetchedRequestIdRef = useRef< string | null >( null );

	// When a new pendingRender appears, prefetch its scene images into data URLs
	// before mounting the compositor. EditFrame's EFImage rewrites non-data: src
	// to a backend asset-proxy URL we don't host, so direct site URLs 404.
	useEffect( () => {
		if ( ! pendingRender ) {
			prefetchedRequestIdRef.current = null;
			if ( mountedRequestId !== null ) {
				setMountedRequestId( null );
			}
			if ( resolvedBrief !== null ) {
				setResolvedBrief( null );
			}
			return;
		}

		const requestId = pendingRender.requestId;
		if ( prefetchedRequestIdRef.current === requestId ) {
			return;
		}
		prefetchedRequestIdRef.current = requestId;

		const prefetchStartedAt = performance.now();
		// eslint-disable-next-line no-console
		console.log( '[FeatureClipRenderHost] phase:prefetching-images', {
			requestId,
			sceneCount: pendingRender.brief.scenes.length,
		} );
		( async () => {
			try {
				const resolved = await resolveBriefImages( pendingRender.brief );
				// eslint-disable-next-line no-console
				console.log( '[FeatureClipRenderHost] prefetch_complete', {
					requestId,
					prefetchMs: Math.round( performance.now() - prefetchStartedAt ),
				} );
				setResolvedBrief( { requestId, brief: resolved } );
				setMountedRequestId( requestId );
			} catch ( error ) {
				const message = error instanceof Error ? error.message : 'Failed to load scene images.';
				// eslint-disable-next-line no-console
				console.error( '[FeatureClipRenderHost] prefetch_failed', { requestId, message } );
				// ALWAYS dispatch — never leave the agent's awaitRenderResult hanging.
				failFeatureClipRender( { requestId, message } );
			}
		} )();
	}, [ pendingRender, resolvedBrief, mountedRequestId, failFeatureClipRender ] );

	// Cancel handling: hard-cancel from the user → clear pending and stop.
	useEffect( () => {
		if ( isCancelling && pendingRender ) {
			clearFeatureClipPending();
		}
	}, [ isCancelling, pendingRender, clearFeatureClipPending ] );

	// Drive the render after the compositor mounts.
	useEffect( () => {
		if ( ! pendingRender || pendingRender.requestId !== mountedRequestId ) {
			return;
		}
		if ( isCancelling ) {
			return;
		}

		let cancelled = false;
		const requestId = pendingRender.requestId;
		const brief = pendingRender.brief;
		const startedAt = performance.now();

		const log = ( phase: string, extra?: Record< string, unknown > ) => {
			const sinceStart = Math.round( performance.now() - startedAt );
			// eslint-disable-next-line no-console
			console.log( `[FeatureClipRenderHost] ${ phase } +${ sinceStart }ms`, {
				requestId,
				...( extra ?? {} ),
			} );
		};

		log( 'render_request_received', {
			style: brief.style,
			sceneCount: brief.scenes.length,
			titleCard: brief.titleCard?.copy,
		} );

		trackFeatureClipRenderStarted( {
			style: brief.style,
			sceneCount: brief.scenes.length,
		} );

		const run = async () => {
			try {
				setFeatureClipProgressPhase( 'composing' );
				log( 'phase:composing' );
				// Wait two animation frames so EditFrame mounts the timegroup
				// before we ask it to render.
				await new Promise< void >( ( resolve ) =>
					requestAnimationFrame( () => requestAnimationFrame( () => resolve() ) )
				);
				if ( cancelled ) {
					return;
				}

				const timegroup = document.getElementById(
					COMPOSITION_ID
				) as RenderToVideoTimegroup | null;
				if ( ! timegroup?.renderToVideo ) {
					throw new Error( 'EditFrame timegroup did not initialize.' );
				}

				setFeatureClipProgressPhase( 'rendering' );
				const renderStartedAt = performance.now();
				log( 'phase:rendering' );
				const result = await timegroup.renderToVideo( RENDER_OPTIONS );
				if ( cancelled ) {
					return;
				}
				const renderMs = Math.round( performance.now() - renderStartedAt );

				const blob = renderResultToBlob( result );
				log( 'render_complete', { renderMs, outputBytes: blob.size } );

				setFeatureClipProgressPhase( 'uploading' );
				const uploadStartedAt = performance.now();
				log( 'phase:uploading' );
				const attachment = await uploadFeatureClipBlob( blob );
				if ( cancelled ) {
					return;
				}
				const uploadMs = Math.round( performance.now() - uploadStartedAt );
				log( 'upload_complete', {
					uploadMs,
					attachmentId: attachment.id,
					durationSeconds: attachment.durationSeconds,
				} );

				// Swap the canvas inline. The orchestrator does NOT call
				// image-studio/update-canvas-video for the photo path — that tool
				// is for the Veo chain only, and leaving the canvas swap to a
				// follow-up LLM tool call lets the model fabricate attachmentIds
				// and skip the actual render. Doing it here removes the escape
				// hatch entirely.
				const videoActions = wpDispatch( videoStudioStore ) as unknown as VideoStudioActions;
				const imageActions = wpDispatch( imageStudioStore ) as unknown as ImageStudioActions;
				await videoActions.setCurrentVideoUrl( attachment.url );
				await videoActions.setCurrentAttachmentId( attachment.id );
				await videoActions.setCurrentDurationSeconds( attachment.durationSeconds );
				imageActions.addNotice(
					__( 'Video saved to Media Library', __i18n_text_domain__ ),
					'success'
				);
				trackImageStudioImageGenerated( {
					mode: ImageStudioMode.Generate,
					attachmentId: attachment.id,
					isAnnotated: false,
				} );

				const totalMs = Math.round( performance.now() - startedAt );
				log( 'render_done_total', {
					totalMs,
					renderMs,
					uploadMs,
					outputBytes: blob.size,
					attachmentId: attachment.id,
				} );

				completeFeatureClipRender( {
					requestId,
					attachmentId: attachment.id,
					url: attachment.url,
					durationSeconds: attachment.durationSeconds,
				} );

				trackFeatureClipRenderCompleted( {
					style: brief.style,
					wallClockMs: performance.now() - startedAt,
					outputSizeBytes: blob.size,
					attachmentId: attachment.id,
				} );
			} catch ( error ) {
				if ( cancelled ) {
					return;
				}
				const message = error instanceof Error ? error.message : 'Render failed.';
				log( 'render_failed', {
					message,
					totalMs: Math.round( performance.now() - startedAt ),
				} );
				failFeatureClipRender( { requestId, message } );
				trackImageStudioError( {
					mode: ImageStudioMode.Generate,
					errorType: 'generation_failed',
				} );
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [
		pendingRender,
		mountedRequestId,
		isCancelling,
		setFeatureClipProgressPhase,
		completeFeatureClipRender,
		failFeatureClipRender,
	] );

	const apiHost = typeof window !== 'undefined' ? window.location.origin : '';
	const briefForMount = useMemo< FeatureClipBrief | null >( () => {
		if ( ! mountedRequestId || ! resolvedBrief ) {
			return null;
		}
		if ( resolvedBrief.requestId !== mountedRequestId ) {
			return null;
		}
		return resolvedBrief.brief;
	}, [ mountedRequestId, resolvedBrief ] );

	if ( ! briefForMount ) {
		return null;
	}

	const TimelineComponent = ( { id }: Record< string, unknown > ) => (
		<FeatureClipVideo id={ String( id ) } brief={ briefForMount } />
	);
	TimelineComponent.displayName = 'FeatureClipTimeline';

	return (
		<div
			aria-hidden
			style={ {
				position: 'fixed',
				left: -99999,
				top: -99999,
				width: 1080,
				height: 1920,
				pointerEvents: 'none',
			} }
		>
			<Configuration apiHost={ apiHost } signingURL="">
				<Preview>
					<TimelineRoot
						key={ `mount-${ mountedRequestId }` }
						id={ COMPOSITION_ID }
						component={ TimelineComponent }
					/>
				</Preview>
			</Configuration>
		</div>
	);
}

function renderResultToBlob( result: unknown ): Blob {
	if ( result instanceof Blob ) {
		return result;
	}
	if ( result instanceof ArrayBuffer ) {
		return new Blob( [ result ], { type: 'video/mp4' } );
	}
	if ( ArrayBuffer.isView( result ) ) {
		const view = result as ArrayBufferView;
		const bytes = new Uint8Array( new Uint8Array( view.buffer, view.byteOffset, view.byteLength ) );
		return new Blob( [ bytes ], { type: 'video/mp4' } );
	}
	throw new Error( 'EditFrame did not return MP4 bytes.' );
}
