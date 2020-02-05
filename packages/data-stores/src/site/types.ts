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

export interface NewSiteSuccessResponseBlogDetails {
	url: string;
	blogid: number;
	blogname: string;
	xmlrpc: string;
}

export interface NewSiteSuccessResponse {
	success: boolean;
	blog_details: NewSiteSuccessResponseBlogDetails;
	is_signup_sandbox?: boolean;
}

export interface NewSiteErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export interface NewSiteErrorCreateBlog {
	blog_id?: any; // This has to be `any` as sites/new will return whatever value is passed to it as `$blog_id` if create blog fails.
}

export type NewSiteResponse =
	| NewSiteSuccessResponse
	| NewSiteErrorResponse
	| NewSiteErrorCreateBlog;

export interface CreateSiteParams {
	blog_name: string;
	authToken?: string;
}

export interface CreateSiteAction extends Action {
	params: CreateSiteParams;
}
