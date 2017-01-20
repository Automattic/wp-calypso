
class AudioRepo {
	constructor() {
		this.audio = {};
	}

	/**
	 * Loads an audio sprite and returns it, or returns an existing instance
	 * for the same sprite name.
	 * @param {string} spriteName A reference name for the sprite
	 * @param {string} src The URI to the audio file
	 * @returns {HTMLAudioElement} An instance of an audio element
	 */
	get( spriteName, src ) {
		if ( ! this.audio.hasOwnProperty( spriteName ) ) {
			this.audio[ spriteName ] = new Audio( src );
		}

		return this.audio[ spriteName ];
	}
}

export default new AudioRepo();
