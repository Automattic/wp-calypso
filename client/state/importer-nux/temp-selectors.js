/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

// TODO: Follow project conventions once finalised
export const getNuxUrlInputValue = state => get( state, 'importerNux.urlInputValue' );

export const getSiteDetails = state => get( state, 'importerNux.siteDetails' );

// TODO: Better naming
export const isIsSiteImportableFetching = state => get( state, 'importerNux.isIsSiteImportableFetching' );

export const getUrlInputValidationMessage = state =>
	get( state, 'importerNux.urlInputValidationMessage' );
