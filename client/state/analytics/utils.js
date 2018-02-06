/**
 * Generate a 7-character random hash on base16 for use with TrainTracks as part
 * of the Railcar ID. E.g. ac618a3.
 *
 * @returns {String}  A 7-character random hash.
 */
export function getNewRailcarSeed() {
	return Math.floor( ( 1 + Math.random() ) * 0x10000000 ).toString( 16 ).substring( 1 );
}
