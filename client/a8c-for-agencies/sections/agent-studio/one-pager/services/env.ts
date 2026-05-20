// Env access for the one-pager LLM. Reads build-time values baked into the
// bundle by Calypso's dotenv-webpack from the repo-root `.env`. No runtime
// override — matches the prototype, where `.env` is the only source.

/**
 * Resolves the OpenAI API key from `A4A_OPENAI_API_KEY`.
 * @returns The key string, or undefined when the env var is not set.
 */
export function getOpenAIApiKey(): string | undefined {
	return process.env.A4A_OPENAI_API_KEY;
}

/**
 * Resolves the LLM model id from `A4A_LLM_MODEL`, falling back to the
 * prototype's default.
 * @returns The model id.
 */
export function getLLMModel(): string {
	return process.env.A4A_LLM_MODEL || 'gpt-5.4-mini';
}

/**
 * Per-million-token pricing override from `A4A_LLM_INPUT_PRICE` /
 * `A4A_LLM_OUTPUT_PRICE` so cost reporting stays accurate when the model id
 * isn't in the built-in pricing table.
 * @returns Override pricing, or undefined when no override is set.
 */
export function getLLMPricingOverride(): { input: number; output: number } | undefined {
	const inputRaw = process.env.A4A_LLM_INPUT_PRICE;
	const outputRaw = process.env.A4A_LLM_OUTPUT_PRICE;
	if ( ! inputRaw && ! outputRaw ) {
		return undefined;
	}
	const input = parseFloat( inputRaw ?? '' );
	const output = parseFloat( outputRaw ?? '' );
	if ( ! Number.isFinite( input ) || ! Number.isFinite( output ) ) {
		return undefined;
	}
	return { input, output };
}
