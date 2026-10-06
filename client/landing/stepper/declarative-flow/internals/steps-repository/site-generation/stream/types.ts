// The optional live feed of a build-wow run. The status endpoint advertises it
// in its `stream` block; the events and snapshot endpoints it names carry
// Engine build events wrapped in the host's envelope. Nothing here is
// authoritative: status polling alone decides live, failed, and navigation.

export const BUILD_WOW_STREAM_PROTOCOL = 1;

export type BuildWowStreamInfo = {
	protocol: number;
	blogId: number;
	runId: string;
	graph?: string;
	mode?: string;
	resultKind?: string;
	capabilities: string[];
	eventsUrl: string;
	snapshotUrl: string;
};

export type BuildWowStreamEnvelope = {
	runId: string;
	seq: number;
	type: string;
	data: Record< string, unknown >;
	// A phased host's retry of the same run; later attempts replace earlier state.
	attempt?: number;
};

export type BuildWowStreamSnapshot = {
	runId: string;
	cursor: number;
	state: Record< string, unknown >;
};

function isRecord( value: unknown ): value is Record< string, unknown > {
	return typeof value === 'object' && value !== null && ! Array.isArray( value );
}

function isCursor( value: unknown ): value is number {
	return typeof value === 'number' && Number.isInteger( value ) && value >= 0;
}

// A Bearer token is sent to these URLs, so only https (or plain http when the
// page itself is served over http from the same host, for local development)
// is accepted, and both URLs must share an origin.
function parseFeedUrl( value: unknown ): URL | null {
	if ( typeof value !== 'string' || ! value ) {
		return null;
	}
	let url: URL;
	try {
		url = new URL( value );
	} catch {
		return null;
	}
	const isLocalHttp =
		url.protocol === 'http:' &&
		window.location.protocol === 'http:' &&
		url.hostname === window.location.hostname;
	if ( url.protocol !== 'https:' && ! isLocalHttp ) {
		return null;
	}
	return url;
}

export function parseStreamInfo( raw: unknown ): BuildWowStreamInfo | null {
	if ( ! isRecord( raw ) || raw.protocol !== BUILD_WOW_STREAM_PROTOCOL ) {
		return null;
	}
	const blogId = Number( raw.blog_id );
	if ( ! Number.isInteger( blogId ) || blogId <= 0 ) {
		return null;
	}
	if ( typeof raw.run_id !== 'string' || ! raw.run_id ) {
		return null;
	}
	const eventsUrl = parseFeedUrl( raw.events_url );
	const snapshotUrl = parseFeedUrl( raw.snapshot_url );
	if ( ! eventsUrl || ! snapshotUrl || eventsUrl.origin !== snapshotUrl.origin ) {
		return null;
	}

	return {
		protocol: raw.protocol,
		blogId,
		runId: raw.run_id,
		graph: typeof raw.graph === 'string' ? raw.graph : undefined,
		mode: typeof raw.mode === 'string' ? raw.mode : undefined,
		resultKind: typeof raw.result_kind === 'string' ? raw.result_kind : undefined,
		capabilities: Array.isArray( raw.capabilities )
			? raw.capabilities.filter( ( item ): item is string => typeof item === 'string' )
			: [],
		eventsUrl: eventsUrl.href,
		snapshotUrl: snapshotUrl.href,
	};
}

export function parseEnvelope( raw: unknown ): BuildWowStreamEnvelope | null {
	if ( ! isRecord( raw ) || raw.v !== BUILD_WOW_STREAM_PROTOCOL ) {
		return null;
	}
	if ( typeof raw.run_id !== 'string' || ! isCursor( raw.seq ) || typeof raw.type !== 'string' ) {
		return null;
	}
	const attempt = Number.isInteger( raw.attempt ) ? ( raw.attempt as number ) : undefined;

	return {
		runId: raw.run_id,
		seq: raw.seq,
		type: raw.type,
		data: isRecord( raw.data ) ? raw.data : {},
		...( attempt !== undefined ? { attempt } : {} ),
	};
}

export function parseSnapshot( raw: unknown ): BuildWowStreamSnapshot | null {
	if ( ! isRecord( raw ) || raw.v !== BUILD_WOW_STREAM_PROTOCOL ) {
		return null;
	}
	if ( typeof raw.run_id !== 'string' || ! isCursor( raw.cursor ) ) {
		return null;
	}

	return {
		runId: raw.run_id,
		cursor: raw.cursor,
		state: isRecord( raw.state ) ? raw.state : {},
	};
}

export function isStreamInfoEqual(
	a: BuildWowStreamInfo | null,
	b: BuildWowStreamInfo | null
): boolean {
	if ( ! a || ! b ) {
		return a === b;
	}
	return (
		a.runId === b.runId &&
		a.blogId === b.blogId &&
		a.eventsUrl === b.eventsUrl &&
		a.snapshotUrl === b.snapshotUrl &&
		a.resultKind === b.resultKind &&
		a.capabilities.join( ' ' ) === b.capabilities.join( ' ' )
	);
}
