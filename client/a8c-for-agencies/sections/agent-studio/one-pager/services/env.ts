// Local-key resolution for the one-pager LLM. Reads from build-time env first,
// then falls back to a localStorage override the dev-key modal writes. Server
// impls bypass this entirely by replacing the LLMService.

const LOCAL_KEY_STORAGE_KEY = 'a4a-agent-studio-one-pager-dev-key';
const LOCAL_MODEL_STORAGE_KEY = 'a4a-agent-studio-one-pager-dev-model';

function safeLocalStorageGet( key: string ): string | undefined {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return undefined;
	}
	try {
		return window.localStorage.getItem( key ) ?? undefined;
	} catch {
		return undefined;
	}
}

function safeLocalStorageSet( key: string, value: string | undefined ): void {
	if ( typeof window === 'undefined' || ! window.localStorage ) {
		return;
	}
	try {
		if ( value ) {
			window.localStorage.setItem( key, value );
		} else {
			window.localStorage.removeItem( key );
		}
	} catch {
		// Best-effort.
	}
}

/**
 * Resolves the OpenAI API key, preferring the dev runtime override over the
 * build-time env value.
 * @returns The key string, or undefined when no key is configured.
 */
export function getOpenAIApiKey(): string | undefined {
	const runtime = safeLocalStorageGet( LOCAL_KEY_STORAGE_KEY );
	if ( runtime ) {
		return runtime;
	}
	return process.env.A4A_OPENAI_API_KEY;
}

/**
 * Resolves the LLM model id. Runtime localStorage wins over build-time.
 * Falls back to gpt-4o-mini which works with cheap dev keys.
 * @returns The model id.
 */
export function getLLMModel(): string {
	const runtime = safeLocalStorageGet( LOCAL_MODEL_STORAGE_KEY );
	if ( runtime ) {
		return runtime;
	}
	return process.env.A4A_LLM_MODEL || 'gpt-4o-mini';
}

export function setLocalDevKey( key: string | undefined ): void {
	safeLocalStorageSet( LOCAL_KEY_STORAGE_KEY, key );
}

export function setLocalDevModel( model: string | undefined ): void {
	safeLocalStorageSet( LOCAL_MODEL_STORAGE_KEY, model );
}

export function getLocalDevKey(): string | undefined {
	return safeLocalStorageGet( LOCAL_KEY_STORAGE_KEY );
}

export function getLocalDevModel(): string | undefined {
	return safeLocalStorageGet( LOCAL_MODEL_STORAGE_KEY );
}

export function isDevEnvironment(): boolean {
	return process.env.NODE_ENV !== 'production';
}
