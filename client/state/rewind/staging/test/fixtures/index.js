import {
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE,
} from 'calypso/state/action-types';

export const stagingSites = [
	{
		blog_id: 123456,
		domain: 'test1.jurassic.ninja',
		siteurl: 'https://test1.jurassic.ninja',
		staging: true,
	},
	{
		blog_id: 234567,
		domain: 'test2.jurassic.ninja',
		siteurl: 'https://test2.jurassic.ninja',
		staging: true,
	},
	{
		blog_id: 345678,
		domain: 'test3.jurassic.ninja',
		siteurl: 'https://test3.jurassic.ninja',
		staging: true,
	},
];

export const testActions = {
	request: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST,
		siteId: 999999,
	},
	successWithSites: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
		siteId: 999999,
		stagingSitesList: stagingSites,
	},
	successWithoutSites: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_SUCCESS,
		siteId: 888888,
		stagingSitesList: [],
	},
	failure: {
		type: JETPACK_BACKUP_STAGING_LIST_REQUEST_FAILURE,
		siteId: 777777,
	},
};

export const updateStagingActions = {
	request: {
		type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
		siteId: 999999,
	},
	success: {
		type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST_SUCCESS,
		siteId: 888888,
	},
	failure: {
		type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST_FAILURE,
		siteId: 777777,
	},
};
