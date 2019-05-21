/**
 * Internal dependencies
 */
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_ADD_REQUEST_FAILURE,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Types
 */
import { SiteId, UserId } from 'types';
import { ExternalContributor } from './types';

/**
 * Data Layer
 */
import 'state/data-layer/wpcom/sites/external-contributors';

export const getExternalContributors = ( siteId: SiteId ) => ( {
	type: EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	siteId,
} );

export const receiveGetExternalContributorsSuccess = (
	siteId: SiteId,
	contributors: ExternalContributor
) => ( {
	type: EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
	siteId,
	contributors,
} );

export const receiveGetExternalContributorsFailure = ( siteId: SiteId, error ) => ( {
	type: EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
	siteId,
	error,
} );

export const addExternalContributor = ( siteId: SiteId, userId: UserId ) => ( {
	type: EXTERNAL_CONTRIBUTORS_ADD_REQUEST,
	siteId,
	userId,
} );

export const receiveAddExternalContributorSuccess = ( siteId: SiteId, userId: UserId ) => ( {
	type: EXTERNAL_CONTRIBUTORS_ADD_REQUEST_SUCCESS,
	siteId,
	userId,
} );

export const receiveAddExternalContributorFailure = ( siteId: SiteId, userId: UserId, error ) => ( {
	type: EXTERNAL_CONTRIBUTORS_ADD_REQUEST_FAILURE,
	siteId,
	userId,
	error,
} );

export const removeExternalContributor = ( siteId: SiteId, userId: UserId ) => ( {
	type: EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST,
	siteId,
	userId,
} );

export const receiveRemoveExternalContributorSuccess = ( siteId: SiteId, userId: UserId ) => ( {
	type: EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_SUCCESS,
	siteId,
	userId,
} );

export const receiveRemoveExternalContributorFailure = (
	siteId: SiteId,
	userId: UserId,
	error
) => ( {
	type: EXTERNAL_CONTRIBUTORS_REMOVE_REQUEST_FAILURE,
	siteId,
	userId,
	error,
} );
