/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { hasSiteAnalyticsFeature } from '../utils';
import wrapSettingsForm from '../wrap-settings-form';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import GoogleAnalyticsJetpackForm from './form-google-analytics-jetpack';
import GoogleAnalyticsSimpleForm from './form-google-analytics-simple';

/**
 * Style dependencies
 */
import './style.scss';

export const GoogleAnalyticsForm = ( props ) => {
	if ( props.siteIsJetpack ) {
		return <GoogleAnalyticsJetpackForm { ...props } />;
	}
	return <GoogleAnalyticsSimpleForm { ...props } />;
};

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isGoogleAnalyticsEligible = hasSiteAnalyticsFeature( site );
	const jetpackModuleActive = isJetpackModuleActive( state, siteId, 'google-analytics' );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const googleAnalyticsEnabled = site && ( ! siteIsJetpack || jetpackModuleActive );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		enableForm: isGoogleAnalyticsEligible && googleAnalyticsEnabled,
		path,
		showUpgradeNudge: ! isGoogleAnalyticsEligible,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
		jetpackModuleActive,
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps, null, { pure: false } );

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( GoogleAnalyticsForm );
