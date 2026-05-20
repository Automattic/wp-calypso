import { getLLMModel, getLLMPricingOverride, getOpenAIApiKey } from './env';
import type { LLMChatRequest, LLMChatResponse, LLMService } from './types';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Rough public prices in USD per 1M tokens. Used only to log a cost estimate
// next to the output — the dev key holder bears the real bill at OpenAI.
const MODEL_PRICING: Record< string, { input: number; output: number } > = {
	'gpt-4o-mini': { input: 0.15, output: 0.6 },
	'gpt-4o': { input: 2.5, output: 10 },
	'gpt-4.1-mini': { input: 0.4, output: 1.6 },
	'gpt-4.1': { input: 2, output: 8 },
};

function priceFor( model: string ): { input: number; output: number } | undefined {
	return getLLMPricingOverride() ?? MODEL_PRICING[ model ];
}

export class OpenAIMissingKeyError extends Error {
	constructor() {
		super(
			'OpenAI API key is not configured. Set A4A_OPENAI_API_KEY in .env or use the Set local key link in the brief screen.'
		);
		this.name = 'OpenAIMissingKeyError';
	}
}

export const defaultLLMService: LLMService = {
	async chat( request: LLMChatRequest ): Promise< LLMChatResponse > {
		const apiKey = getOpenAIApiKey();
		if ( ! apiKey ) {
			throw new OpenAIMissingKeyError();
		}

		const model = request.model || getLLMModel();
		const body: Record< string, unknown > = {
			model,
			messages: request.messages,
		};
		if ( request.responseFormat === 'json_object' ) {
			body.response_format = { type: 'json_object' };
		}
		if ( request.reasoningEffort && request.reasoningEffort !== 'none' ) {
			body.reasoning_effort = request.reasoningEffort;
		}

		const startedAt = performance.now();
		const response = await fetch( OPENAI_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${ apiKey }`,
			},
			body: JSON.stringify( body ),
			signal: request.signal,
		} );

		if ( ! response.ok ) {
			const errorBody = await response.text();
			throw new Error( `LLM call failed (${ response.status }): ${ errorBody }` );
		}

		const data = await response.json();
		const content = data.choices?.[ 0 ]?.message?.content;
		if ( typeof content !== 'string' ) {
			throw new Error( 'LLM returned empty content' );
		}

		const usage = data.usage ?? {};
		const inputTokens = usage.prompt_tokens ?? 0;
		const outputTokens = usage.completion_tokens ?? 0;
		const pricing = priceFor( model );
		const usd = pricing
			? ( inputTokens * pricing.input ) / 1_000_000 + ( outputTokens * pricing.output ) / 1_000_000
			: undefined;

		return {
			content,
			inputTokens,
			outputTokens,
			model,
			usd,
			durationMs: performance.now() - startedAt,
		};
	},
};
