// Mastodon status IDs as projected by the home-instance backend are
// 64-bit snowflake decimals. The thread endpoint validates with the
// same `is_safe_int_id` rule, so accept the same shape here.
export const STATUS_ID_RE = /^[0-9]{1,32}$/;

export function getTimelineUrl( connectionId: number ): string {
	return `/reader/mastodon/${ connectionId }/timeline`;
}

// Builds the in-app thread URL for a Mastodon status. The `statusId` is
// the home-instance status ID — already what `SocialPost.uri` carries
// for Mastodon-mapped items (the mapper sets `uri = item.id`). For
// remote-origin statuses, the home instance still issues a local ID
// when it caches the status via federation, so home-instance IDs work
// universally.
export function getThreadUrl( connectionId: number, statusId: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	if ( ! STATUS_ID_RE.test( statusId ) ) {
		return null;
	}
	return `/reader/mastodon/${ connectionId }/thread/${ statusId }`;
}
