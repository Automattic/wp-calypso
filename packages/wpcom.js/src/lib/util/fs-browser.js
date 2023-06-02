export function createReadStream() {
	throw new Error( 'Cannot call fs functions within the browser' );
}
