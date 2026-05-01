/**
 * Mirrors CopyPlugin output in apps/help-center/webpack.config.js (deployed under
 * the help-center widget public path, e.g. widgets.wp.com/help-center/).
 */
const DONE_NOTIFICATION_SOUND_RELATIVE_PATH =
	'@packages/help-center/src/live-ai-assistant/tools/notification-sound-tool/the-sounds.mp3';

declare let __webpack_public_path__: string | undefined;

function getDoneNotificationSoundUrl(): string {
	if ( typeof __webpack_public_path__ === 'string' && __webpack_public_path__.trim().length > 0 ) {
		const base = __webpack_public_path__.replace( /\/?$/, '/' );
		return new URL( DONE_NOTIFICATION_SOUND_RELATIVE_PATH, base ).href;
	}
	return `https://widgets.wp.com/help-center/${ DONE_NOTIFICATION_SOUND_RELATIVE_PATH }`;
}

export const PLAY_DONE_SOUND_TOOL_NAME = 'play_done_sound_tool';

export const playDoneSoundToolDefinition = {
	type: 'function',
	name: PLAY_DONE_SOUND_TOOL_NAME,
	description:
		'Play a gentle audible cue from a short sound clip to acknowledge that a dictation chunk has been written or an action has completed. Use this INSTEAD OF speaking a verbal acknowledgement like "done", "got it", "added", or "okay". Safe to call as often as needed and preferred over any spoken confirmation while the user is dictating.',
	parameters: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
} as const;

export function executePlayDoneSoundTool() {
	try {
		const audio = new Audio( getDoneNotificationSoundUrl() );
		audio.volume = 0.45;
		void audio.play().catch( () => {} );

		return { ok: true } as const;
	} catch ( error ) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Failed to play notification sound.',
		} as const;
	}
}
