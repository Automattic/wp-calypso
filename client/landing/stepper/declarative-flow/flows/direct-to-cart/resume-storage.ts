const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export interface ResumeRecord {
	siteSlug: string;
	plan: string;
	createdAt: number;
}

export function resumeKey( integration: string | null, contextId: string | null ): string {
	return `direct-to-cart:${ integration ?? '' }:${ contextId ?? '' }`;
}

export function readResumeRecord( key: string ): ResumeRecord | null {
	let raw: string | null;
	try {
		raw = window.localStorage.getItem( key );
	} catch {
		return null;
	}
	if ( ! raw ) {
		return null;
	}

	let parsed: ResumeRecord;
	try {
		parsed = JSON.parse( raw ) as ResumeRecord;
	} catch {
		clearResumeRecord( key );
		return null;
	}

	if (
		typeof parsed?.siteSlug !== 'string' ||
		typeof parsed?.plan !== 'string' ||
		typeof parsed?.createdAt !== 'number'
	) {
		clearResumeRecord( key );
		return null;
	}

	if ( Date.now() - parsed.createdAt > TTL_MS ) {
		clearResumeRecord( key );
		return null;
	}

	return parsed;
}

export function writeResumeRecord(
	key: string,
	value: Pick< ResumeRecord, 'siteSlug' | 'plan' >
): void {
	try {
		window.localStorage.setItem(
			key,
			JSON.stringify( {
				siteSlug: value.siteSlug,
				plan: value.plan,
				createdAt: Date.now(),
			} )
		);
	} catch {
		// localStorage may be full or unavailable; failing silently is acceptable
		// because resumability is a UX optimization, not correctness.
	}
}

export function clearResumeRecord( key: string ): void {
	try {
		window.localStorage.removeItem( key );
	} catch {
		// no-op
	}
}
