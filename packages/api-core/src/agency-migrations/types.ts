import type { AgencySiteTag } from '../agency-site-tags/types';

export interface MigrationCommissionSite {
	id: number;
	blog_id: number;
	created_at: number;
	url: string;
	state: string;
	tags: AgencySiteTag[];
	incentive_status: string;
	incentive_rejection_reason?: string;
	features?: {
		wpcom_atomic?: {
			// `active` once a WordPress.com site is ready to use.
			state?: string;
			blog_id?: number;
		};
	};
}

/**
 * The list endpoint returns either a bare array or an object with a `sites`
 * property depending on the account; the fetcher normalizes both to an array.
 */
export type MigrationCommissionSitesResponse =
	| MigrationCommissionSite[]
	| { sites?: MigrationCommissionSite[] };

export interface TagSitesForCommissionInput {
	siteIds: number[];
	tags: string[];
	migrationSourceHost: string;
}

export interface AgencySiteTagError {
	code?: string;
	message?: string;
}

/**
 * The tag-for-commission endpoint returns a per-site result keyed by site id:
 * either the applied tags or an error for that site.
 */
export type TagSitesForCommissionResponse = Record< number, AgencySiteTag[] | AgencySiteTagError >;

export interface RequestReverificationInput {
	siteId: number;
	reason: string;
}
