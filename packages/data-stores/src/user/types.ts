/**
 * External dependencies
 */

import { Action } from 'redux';

export const enum ActionType {
	CREATE_ACCOUNT = 'CREATE_ACCOUNT',
	RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER',
	RECEIVE_CURRENT_USER_FAILED = 'RECEIVE_CURRENT_USER_FAILED',
	FETCH_CURRENT_USER = 'FETCH_CURRENT_USER',
	RECEIVE_NEW_USER = 'RECEIVE_NEW_USER',
	RECEIVE_NEW_USER_SUCCESS = 'RECEIVE_NEW_USER',
	RECEIVE_NEW_USER_FAILED = 'RECEIVE_NEW_USER_FAILED',
	FETCH_NEW_USER = 'FETCH_NEW_USER',
}

export interface CurrentUser {
	ID: number;
	display_name: string;
	username: string;
	language: string;
}

export interface NewUser {
	userId: string | number | undefined;
	username: string | undefined;
	bearerToken: string | null | undefined;
}

export interface NewUserSuccessResponse {
	success: boolean;
	is_signup_sandbox: boolean;
	bearer_token: string;
	username?: string;
	signup_sandbox_username?: string;
	user_id?: number;
	signup_sandbox_user_id?: string;
}

export interface NewUserErrorResponse {
	error: string;
	status: number;
	statusCode: number;
	name: string;
	message: string;
}

export type NewUserResponse = NewUserSuccessResponse | NewUserErrorResponse;

export interface CreateAccountParams {
	email: string;
	password?: string;
	is_passwordless?: boolean;
	signup_flow_name?: string;
	locale?: string;
	extra?: {
		first_name?: string;
		last_name?: string;
	};
}

export interface CreateAccountAction extends Action {
	params?: CreateAccountParams;
}
