import { defaultBrandPackService } from './brand-pack-service';
import { defaultLLMService } from './llm-service';
import { defaultPdfService } from './pdf-service';
import { defaultStorageService } from './storage-service';
import { noopTelemetryService } from './telemetry-service';
import { defaultThumbnailService } from './thumbnail-service';
import type {
	BrandPackService,
	LLMService,
	PdfService,
	StorageService,
	TelemetryService,
	ThumbnailService,
} from './types';

export interface OnePagerServices {
	llm: LLMService;
	pdf: PdfService;
	thumbnail: ThumbnailService;
	brandPack: BrandPackService;
	storage: StorageService;
	telemetry: TelemetryService;
}

let currentServices: OnePagerServices = {
	llm: defaultLLMService,
	pdf: defaultPdfService,
	thumbnail: defaultThumbnailService,
	brandPack: defaultBrandPackService,
	storage: defaultStorageService,
	telemetry: noopTelemetryService,
};

export function getOnePagerServices(): OnePagerServices {
	return currentServices;
}

/**
 * Override one or more services. Server-side wiring (wpcom LLM, server PDF)
 * calls this once at app start. Anything not overridden keeps its default.
 * @param overrides - Partial set of service replacements.
 */
export function setOnePagerServices( overrides: Partial< OnePagerServices > ): void {
	currentServices = { ...currentServices, ...overrides };
}

export type {
	LLMService,
	PdfService,
	ThumbnailService,
	BrandPackService,
	StorageService,
	TelemetryService,
	LLMChatRequest,
	LLMChatResponse,
	LLMChatMessage,
	PageRender,
	OnePagerStorageInput,
	BrandPackSummary,
} from './types';
