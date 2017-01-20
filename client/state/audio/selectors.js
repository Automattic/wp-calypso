
// Maps the audio sprite name to the audio file source.
// In future this could be moved to the state tree in case
// we want the sounds to be configurable.
const spriteMap = {
	'happychat-message-received': '/calypso/audio/chat-pling.wav',
};

/**
 * Returns the URI to an audio file for the given sprite reference
 * @param {string} sprite The sprite reference
 * @returns {string} The URI to the audio file
 */
export function getAudioSourceForSprite( sprite ) {
	return spriteMap[ sprite ];
}
