/**
 * DIFM page instances: each selected page carries an opaque UUID `id` plus its
 * canonical `type`. Type lives alongside id (never embedded in it) so ids stay
 * collision-proof across add/remove cycles and consumers don't parse strings.
 */

import type { PageId } from './constants';

export interface PageInstance {
	id: string;
	type: PageId;
	title?: string;
}

/** Mint a fresh, opaque instance id. */
export function newInstanceId(): string {
	return crypto.randomUUID();
}

/** Build PageInstance[] from a list of page types (e.g. API selected_page_titles fallback). */
export function synthesizeInstancesFromTitles( titles: PageId[] ): PageInstance[] {
	return titles.map( ( type ) => ( { id: newInstanceId(), type } ) );
}
