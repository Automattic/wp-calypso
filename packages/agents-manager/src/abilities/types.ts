import type { FilePart } from '@automattic/agenttic-client';

export type { Ability } from '@wordpress/abilities';

export interface AbilityResult {
	result: {
		success: boolean;
		message: string;
		error?: string;
		details?: Record< string, unknown >;
	};
	returnToAgent: boolean;
	agentMessage?: string;
	// A sibling of `result`, not part of it: the agent client lifts it onto the
	// tool-result part rather than into the text the model reads.
	__file_parts?: FilePart[];
}
