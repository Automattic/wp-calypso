/**
 * Extracts JSON from an AI model/agent response.
 *
 * LLM responses often wrap JSON in markdown code blocks or include explanatory
 * text around the JSON payload. This function handles these common patterns:
 *
 * 1. Direct JSON parsing (if the response is already valid JSON)
 * 2. Extraction from markdown code blocks
 * @param responseText - The raw text response from the AI model.
 * @returns The parsed JSON value, or null if no valid JSON could be extracted.
 */
export function extractJsonFromModelResponse( responseText: string ): any | null {
	// Try direct parse first
	try {
		return JSON.parse( responseText );
	} catch {
		// Continue to extraction
	}

	// Extract JSON from markdown code blocks or surrounding text
	const patterns = [
		/```(?:json)?\s*([\s\S]*?)```/, // Markdown code block
		/(\{[\s\S]*\})/, // Any JSON object
	];

	for ( const pattern of patterns ) {
		const match = responseText.match( pattern );
		if ( match?.[ 1 ] ) {
			try {
				return JSON.parse( match[ 1 ].trim() );
			} catch {
				continue;
			}
		}
	}

	return null;
}
