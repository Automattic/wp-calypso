export const STOP_DICTATION_TOOL_NAME = 'stop_dictation_tool';

export const stopDictationToolDefinition = {
	type: 'function',
	name: STOP_DICTATION_TOOL_NAME,
	description:
		'Stop the current dictation session when the user asks to stop, end, cancel, or finish dictation.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export function executeStopDictationTool(): { ok: true; action: 'stop_dictation' } {
	return { ok: true, action: 'stop_dictation' };
}
