import { abortInFlightImageGeneration } from './generate-image-tool';

export const STOP_DICTATION_TOOL_NAME = 'stop_dictation_tool';

export const stopDictationToolDefinition = {
	type: 'function',
	name: STOP_DICTATION_TOOL_NAME,
	description:
		'Stop the entire dictation SESSION (mic off, panel idle) when the user clearly wants to end dictation altogether — e.g. "stop dictation", "end the session", "I\'m done", "finish up", "that\'s all". Do NOT call this when the user says a bare "stop" / "cancel" / "never mind" while an image is generating; in that case use cancel_image_generation_tool instead — they only want to abandon the image, not end the session.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export function executeStopDictationTool(): { ok: true; action: 'stop_dictation' } {
	return { ok: true, action: 'stop_dictation' };
}

export const CANCEL_IMAGE_GENERATION_TOOL_NAME = 'cancel_image_generation_tool';

export const cancelImageGenerationToolDefinition = {
	type: 'function',
	name: CANCEL_IMAGE_GENERATION_TOOL_NAME,
	description:
		'Cancel the image generation that is currently in progress (i.e. you previously called generate_image_tool and have not yet received its result). Use this — NOT stop_dictation_tool — when the user says "stop", "cancel", "never mind", "abort", "don\'t make that", "scratch that", or similar while an image is being generated. This only abandons the in-flight image; dictation keeps running so the user can continue.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export function executeCancelImageGenerationTool():
	| { ok: true; cancelled: true }
	| { ok: false; error: string } {
	const cancelled = abortInFlightImageGeneration();
	if ( cancelled ) {
		return { ok: true, cancelled: true };
	}
	return { ok: false, error: 'No image generation is currently in progress.' };
}
