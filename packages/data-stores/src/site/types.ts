/**
 * External dependencies
 */

import { Action } from 'redux';

export const enum ActionType {
	CREATE_SITE = 'CREATE_SITE',
	RECEIVE_NEW_SITE = 'RECEIVE_NEW_SITE',
	RECEIVE_NEW_SITE_SUCCESS = 'RECEIVE_NEW_SITE',
	RECEIVE_NEW_SITE_FAILED = 'RECEIVE_NEW_SITE_FAILED',
	FETCH_NEW_SITE = 'FETCH_NEW_SITE',
}

export interface NewSite {
	blogname: string;
	blogid: string;
	blog_details: object;
}

export interface NewSiteSuccessResponse {
	success: boolean;
	blog_details: object;
}

export interface NewSiteErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export type NewSiteResponse = NewSiteSuccessResponse | NewSiteErrorResponse;

export interface CreateSiteParams {
	blog_name: string;
	authToken?: string;
}

export interface CreateSiteAction extends Action {
	params: CreateSiteParams;
}
