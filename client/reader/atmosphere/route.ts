export const POST_NSID = 'app.bsky.feed.post';
const DID_WEB_HOST = '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+';
const DID_BODY = `(?:plc:[a-z2-7]{24}|web:${ DID_WEB_HOST })`;
export const DID_RE = new RegExp( `^did:${ DID_BODY }$` );
export const RKEY_RE = /^[a-z0-9]{13}$/;
export const AT_URI_RE = new RegExp( `^at:\\/\\/(did:${ DID_BODY })\\/([^/]+)\\/([a-z0-9]{13})$` );

export function getTimelineUrl( connectionId: number ): string {
	return `/reader/atmosphere/${ connectionId }/timeline`;
}

export function getThreadUrl( connectionId: number, postUri: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const matched = postUri.match( AT_URI_RE );
	if ( ! matched ) {
		return null;
	}
	const [ , did, nsid, rkey ] = matched;
	if ( nsid !== POST_NSID ) {
		return null;
	}
	return `/reader/atmosphere/${ connectionId }/thread/${ did }/${ rkey }`;
}
