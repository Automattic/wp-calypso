import { Action } from 'redux';
import {
	JETPACK_BACKUP_STAGING_GET_REQUEST,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
} from 'calypso/state/action-types';

export interface APIRewindStagingSiteList {
	ok: boolean;
	error: string;
	sites_info: APIRewindStagingSiteInfo[];
}

export interface APIRewindStagingSiteGet {
	ok: boolean;
	error: string;
	info: APIRewindStagingSiteInfo;
}

export interface APIRewindStagingSiteInfo {
	blog_id: number;
	domain: string;
	siteurl: string;
	staging: boolean;
	role: string;
}

/**
 * Request action types
 */
export type ListStagingSitesRequestActionType = Action<
	typeof JETPACK_BACKUP_STAGING_LIST_REQUEST
> & {
	siteId: number | null;
};

export type UpdateStagingFlagRequestActionType = Action<
	typeof JETPACK_BACKUP_STAGING_UPDATE_REQUEST
> & {
	siteId: number | null;
	staging: boolean | false;
};

export type GetStagingSiteRequestActionType = Action<
	typeof JETPACK_BACKUP_STAGING_GET_REQUEST
> & {
	siteId: number | null;
};
