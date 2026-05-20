// Service interfaces for the one-pager engine. The engine consumes these
// instead of calling fetch / localStorage / DOM rasterizers directly so a
// server impl can drop in without touching the prompt or layouts.

import type { BrandPack, ElaPageTheme, OnePagerInputSnapshot } from '../engine/types';

/**
 * Chat completion call shape. Modeled after OpenAI's API so the default impl
 * is a thin pass-through, but the field names are generic enough that a server
 * impl can forward the request to whatever provider it uses.
 */
export interface LLMChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface LLMChatRequest {
	model: string;
	messages: LLMChatMessage[];
	responseFormat?: 'json_object' | 'text';
	reasoningEffort?: 'none' | 'low' | 'medium' | 'high';
	signal?: AbortSignal;
}

export interface LLMChatResponse {
	content: string;
	inputTokens: number;
	outputTokens: number;
	model: string;
	/** USD cost computed from token counts, when the impl knows pricing. */
	usd?: number;
	durationMs: number;
}

export interface LLMService {
	chat( request: LLMChatRequest ): Promise< LLMChatResponse >;
}

/** A single rendered page — HTML + theme + role. */
export interface PageRender {
	html: string;
	width: number;
	height: number;
	role: 'cover' | 'body';
	theme?: ElaPageTheme;
	coverLayoutId?: string;
}

export interface PdfService {
	/**
	 * Stitches the given pages into a single PDF and returns it as a Blob.
	 * The default impl uses jsPDF + html-to-image on the client; a server
	 * impl can render the HTML through Puppeteer / wkhtmltopdf for higher
	 * fidelity.
	 */
	exportPdf( request: {
		title: string;
		pages: PageRender[];
		signal?: AbortSignal;
	} ): Promise< { blob: Blob; fileName: string } >;
}

export interface ThumbnailService {
	/**
	 * Rasterizes a page's HTML to a PNG data URL used for previews. Returns
	 * the same dimensions the page declares so the receiver can lay out the
	 * thumbnail without re-measuring.
	 */
	renderPagePng( request: { html: string; width: number; height: number } ): Promise< string >;
}

export interface BrandPackSummary {
	slug: string;
	name: string;
}

export interface BrandPackService {
	listPacks(): Promise< BrandPackSummary[] >;
	getPack( slug: string ): Promise< BrandPack >;
	getDefaultPackSlug(): string;
}

export interface TelemetryService {
	trackGenerationStarted( payload: {
		agentId: string;
		brandPackSlug: string;
		outputId: string;
	} ): void;
	trackGenerationCompleted( payload: {
		agentId: string;
		brandPackSlug: string;
		outputId: string;
		model: string;
		inputTokens: number;
		outputTokens: number;
		usd: number;
		durationMs: number;
		pageCount: number;
	} ): void;
	trackGenerationFailed( payload: {
		agentId: string;
		brandPackSlug: string;
		outputId: string;
		error: string;
	} ): void;
	trackDownload( payload: {
		agentId: string;
		outputId: string;
		downloadType: 'pdf' | 'png';
	} ): void;
}

export interface OnePagerStorageInput {
	outputId: string;
	covers: PageRender[];
	bodyPages: PageRender[];
	selectedCoverIdx: number;
	notes: string;
	brandPackSlug: string;
	input: OnePagerInputSnapshot;
	usage: {
		model: string;
		inputTokens: number;
		outputTokens: number;
		usd: number;
		durationMs: number;
	};
	/**
	 * Pre-rendered preview thumbnail PNG data URLs (typically just the active
	 * cover) so the deliverable card can show an image instead of
	 * live-rendering HTML on every list visit. Generated once after the engine
	 * finishes and persisted on the output.
	 */
	previewUrls?: string[];
}

export interface StorageService {
	/**
	 * Persists the result of a successful generation against the agent-studio
	 * output. The default impl writes through `agentStudioService.updateOutput`
	 * so the localStorage mock and the (eventual) wpcom impl share one API.
	 */
	saveGenerationResult( request: OnePagerStorageInput ): Promise< void >;
	markGenerationFailed( request: { outputId: string; error: string } ): Promise< void >;
}
