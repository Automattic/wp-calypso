/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

// TODO: Follow project conventions once finalised
export const getNuxUrlInputValue = state => get( state, 'importerNux.urlInputValue' );

export const getSiteDetails = state => get( state, 'importerNux.siteDetails' );

export const isUrlInputDisabled = state => get( state, 'importerNux.isUrlInputDisabled' );
