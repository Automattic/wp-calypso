import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { generateOnePager } from '../engine/ela';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from '../engine/types';
import { getOnePagerServices } from '../services';
import type { DualLogoOrder, ElaImage, LogoUpload, OnePagerInputSnapshot } from '../engine/types';
import type { PageRender } from '../services/types';

export interface GenerationRequest {
	outputId: string;
	agentId: string;
	pack: string;
	title: string;
	blurb: string;
	text: string;
	images: ElaImage[];
	/**
	 * Primary brand logo override (light-page variant). When the brand pack
	 * has no built-in logo this is the only source.
	 */
	primaryLogoLight?: LogoUpload;
	/** Primary brand logo override (dark-page variant). Falls back to light. */
	primaryLogoDark?: LogoUpload;
	/** Optional partner logo (light-page variant). Triggers dual composition. */
	partnerLogoLight?: LogoUpload;
	/** Optional partner logo (dark-page variant). Falls back to light. */
	partnerLogoDark?: LogoUpload;
	/** Which logo sits on the leading edge of the dual-logo separator. */
	partnerLogoOrder?: DualLogoOrder;
}

export type GenerationPhase = 'idle' | 'thinking' | 'designing' | 'done' | 'failed';

export interface GenerationProgress {
	phase: GenerationPhase;
	thinkingLineIdx: number;
	elapsedMs: number;
	error?: string;
}

const THINKING_LINES = [
	'Reading the brief',
	'Studying the brand',
	'Considering the hierarchy',
	'Sketching a grid',
	'Picking type sizes',
	'Composing the layout',
	'Balancing the columns',
	'Weighing the negative space',
	'Choosing the accents',
	'Assembling the page',
];

export function useThinkingLines( active: boolean ) {
	const [ idx, setIdx ] = useState( 0 );
	useEffect( () => {
		if ( ! active ) {
			return;
		}
		const id = setInterval( () => setIdx( ( i ) => i + 1 ), 3000 );
		return () => clearInterval( id );
	}, [ active ] );
	return THINKING_LINES[ idx % THINKING_LINES.length ];
}

export function useElapsedMs( active: boolean ) {
	const [ elapsed, setElapsed ] = useState( 0 );
	useEffect( () => {
		if ( ! active ) {
			setElapsed( 0 );
			return;
		}
		const startedAt = Date.now();
		const id = setInterval( () => setElapsed( Date.now() - startedAt ), 250 );
		return () => clearInterval( id );
	}, [ active ] );
	return elapsed;
}

/**
 * Runs the one-pager generation pipeline against the configured services.
 * Owns the phase + cancel controller; the caller renders the overlay and
 * fires the navigation on success.
 */
export function useOnePagerGeneration() {
	const [ phase, setPhase ] = useState< GenerationPhase >( 'idle' );
	const [ error, setError ] = useState< string | undefined >();
	const abortRef = useRef< AbortController | null >( null );
	const dispatch = useDispatch();

	const cancel = useCallback( () => {
		abortRef.current?.abort();
	}, [] );

	const run = useCallback(
		async (
			request: GenerationRequest
		): Promise< { ok: true } | { ok: false; error: string } > => {
			const services = getOnePagerServices();
			const controller = new AbortController();
			abortRef.current = controller;
			setError( undefined );
			setPhase( 'thinking' );

			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_one_pager_generation_started', {
					agent_id: request.agentId,
					brand_pack: request.pack,
					output_id: request.outputId,
				} )
			);

			try {
				const pack = await services.brandPack.getPack( request.pack );
				setPhase( 'designing' );
				const result = await generateOnePager( {
					llm: services.llm,
					pack,
					inputText: request.text,
					title: request.title,
					blurb: request.blurb,
					images: request.images,
					primaryLogoLightDataUrl: request.primaryLogoLight?.dataUrl,
					primaryLogoDarkDataUrl: request.primaryLogoDark?.dataUrl,
					partnerLogoLightDataUrl: request.partnerLogoLight?.dataUrl,
					partnerLogoDarkDataUrl: request.partnerLogoDark?.dataUrl,
					partnerLogoOrder: request.partnerLogoOrder,
					signal: controller.signal,
				} );

				const coverRenders: PageRender[] = result.covers.map( ( cover ) => ( {
					html: cover.html,
					width: ELA_PAGE_WIDTH,
					height: ELA_PAGE_HEIGHT,
					role: 'cover',
					theme: cover.theme,
					coverLayoutId: cover.layoutId,
				} ) );
				const bodyRenders: PageRender[] = result.bodyPages.map( ( html ) => ( {
					html,
					width: ELA_PAGE_WIDTH,
					height: ELA_PAGE_HEIGHT,
					role: 'body',
				} ) );

				const snapshot: OnePagerInputSnapshot = {
					text: request.text,
					title: request.title,
					blurb: request.blurb,
					images: request.images,
					brandPackSlug: request.pack,
					primaryLogoLight: request.primaryLogoLight,
					primaryLogoDark: request.primaryLogoDark,
					partnerLogoLight: request.partnerLogoLight,
					partnerLogoDark: request.partnerLogoDark,
					partnerLogoOrder: request.partnerLogoOrder,
				};

				// Snapshot the active cover + first few body pages to PNGs
				// once so the deliverables list shows a magazine-style strip
				// instead of live-rendering HTML on every visit. Sequential
				// so the off-screen renderer never has two pages mounted at
				// the same time. Best-effort: failures fall back to a dark
				// placeholder card until the user reopens the output.
				const thumbHtmls: Array< { html: string; width: number; height: number } > = [];
				const activeCover = coverRenders[ 0 ];
				if ( activeCover ) {
					thumbHtmls.push( {
						html: activeCover.html,
						width: activeCover.width,
						height: activeCover.height,
					} );
				}
				for ( const body of bodyRenders.slice( 0, 3 ) ) {
					thumbHtmls.push( {
						html: body.html,
						width: body.width,
						height: body.height,
					} );
				}
				const previewUrls: string[] = [];
				for ( const thumb of thumbHtmls ) {
					try {
						const dataUrl = await services.thumbnail.renderPagePng( thumb );
						if ( dataUrl ) {
							previewUrls.push( dataUrl );
						}
					} catch ( thumbErr ) {
						// eslint-disable-next-line no-console
						console.warn( '[one-pager] thumbnail failed:', thumbErr );
					}
				}

				await services.storage.saveGenerationResult( {
					outputId: request.outputId,
					covers: coverRenders,
					bodyPages: bodyRenders,
					selectedCoverIdx: 0,
					notes: result.notes,
					brandPackSlug: request.pack,
					input: snapshot,
					usage: {
						model: result.usage.model,
						inputTokens: result.usage.inputTokens,
						outputTokens: result.usage.outputTokens,
						usd: result.usage.usd,
						durationMs: result.usage.durationMs,
					},
					previewUrls: previewUrls.length > 0 ? previewUrls : undefined,
				} );

				dispatch(
					recordTracksEvent( 'calypso_a4a_agent_studio_one_pager_generation_completed', {
						agent_id: request.agentId,
						brand_pack: request.pack,
						output_id: request.outputId,
						model: result.usage.model,
						input_tokens: result.usage.inputTokens,
						output_tokens: result.usage.outputTokens,
						cost_usd: result.usage.usd,
						duration_ms: result.usage.durationMs,
						page_count: result.bodyPages.length + 1,
					} )
				);

				setPhase( 'done' );
				abortRef.current = null;
				return { ok: true };
			} catch ( err ) {
				const message = err instanceof Error ? err.message : String( err );
				// eslint-disable-next-line no-console
				console.error( '[one-pager] generation failed:', err );
				setError( message );
				setPhase( 'failed' );
				dispatch(
					recordTracksEvent( 'calypso_a4a_agent_studio_one_pager_generation_failed', {
						agent_id: request.agentId,
						brand_pack: request.pack,
						output_id: request.outputId,
						error: message,
					} )
				);
				try {
					await services.storage.markGenerationFailed( {
						outputId: request.outputId,
						error: message,
					} );
				} catch {
					// Best effort.
				}
				abortRef.current = null;
				return { ok: false, error: message };
			}
		},
		[ dispatch ]
	);

	return {
		run,
		cancel,
		phase,
		error,
		isRunning: phase === 'thinking' || phase === 'designing',
	};
}
