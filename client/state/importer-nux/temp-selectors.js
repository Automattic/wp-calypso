/**
 * External dependencies
 */
import { get } from 'lodash';

// TODO: Follow project conventions once finalised
export const getNuxUrlInputValue = ( state ) => get( state, 'importerNux.urlInputValue' );

export const getSiteDetails = ( state ) => get( state, 'importerNux.siteDetails' );

export const getSelectedImportEngine = ( state ) => get( getSiteDetails( state ), 'siteEngine' );

export const isImportingFromSignupFlow = ( state ) =>
	!! get( state, 'importerNux.isFromSignupFlow' );

export const getImporterSiteUrl = ( state ) => get( getSiteDetails( state ), 'siteUrl' );
