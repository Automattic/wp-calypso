import { isEditorPage } from '../utils/is-editor-page';
import type { WebMcpModelContext } from './types';

type ModelContextHost = {
	modelContext?: unknown;
};

function isModelContext( value: unknown ): value is WebMcpModelContext {
	return (
		value !== null &&
		typeof value === 'object' &&
		typeof ( value as WebMcpModelContext ).registerTool === 'function'
	);
}

export function isWebMcpExperimentEnabled( search = window.location.search ): boolean {
	return new URLSearchParams( search ).get( 'webmcp' ) === '1';
}

export function getWebMcpModelContext(
	documentHost: ModelContextHost | undefined = typeof document === 'undefined'
		? undefined
		: ( document as unknown as ModelContextHost ),
	navigatorHost: ModelContextHost | undefined = typeof navigator === 'undefined'
		? undefined
		: ( navigator as unknown as ModelContextHost )
): WebMcpModelContext | undefined {
	if ( isModelContext( documentHost?.modelContext ) ) {
		return documentHost.modelContext;
	}

	if ( isModelContext( navigatorHost?.modelContext ) ) {
		return navigatorHost.modelContext;
	}

	return undefined;
}

export function canExposeWebMcpTools(): boolean {
	return isWebMcpExperimentEnabled() && isEditorPage() && !! getWebMcpModelContext();
}
