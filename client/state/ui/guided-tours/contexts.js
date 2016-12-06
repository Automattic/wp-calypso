/**
 * Internal dependencies
 */
import config from 'config';
import { getSectionName, isPreviewShowing, getSelectedSite } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { abtest } from 'lib/abtest';

export const inSection = sectionName => state =>
	getSectionName( state ) === sectionName;

export const isEnabled = feature => () =>
	config.isEnabled( feature );

export const previewIsNotShowing = state =>
	! isPreviewShowing( state );

export const previewIsShowing = state =>
	isPreviewShowing( state );

const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;
export const isNewUser = state => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return false;
	}

	const creation = Date.parse( user.date );
	return ( Date.now() - creation ) <= WEEK_IN_MILLISECONDS;
};

export const selectedSiteIsPreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

export const selectedSiteIsCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

export const isAbTestInVariant = ( testName, variant ) => () =>
	abtest( testName ) === variant;
