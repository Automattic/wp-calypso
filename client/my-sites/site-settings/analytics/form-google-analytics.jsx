/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import hasSiteAnalyticsFeature from 'calypso/state/selectors/has-site-analytics-feature';
import isSiteWPCOMOnFreePlan from 'calypso/state/selectors/is-site-wpcom-on-free-plan';
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

const validateGoogleAnalyticsCode = ( code ) =>
	! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i );
export const GoogleAnalyticsForm = ( props ) => {
	const {
		isRequestingSettings,
		isSavingSettings,
		enableForm,
		translate,
		fields,
		updateFields,
		trackTracksEvent,
		eventTracker,
		uniqueEventTracker,
		path,
		isFreeWPCOM,
	} = props;
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ loggedGoogleAnalyticsModified, setLoggedGoogleAnalyticsModified ] = useState( false );
	const [ displayForm, setDisplayForm ] = useState( false );
	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;
	const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';

	const handleFieldChange = ( key, value, callback = () => {} ) => {
		const updatedFields = Object.assign( {}, fields.wga || {}, {
			[ key ]: value,
		} );
		updateFields( { wga: updatedFields }, callback );
	};

	const handleCodeChange = ( event ) => {
		const code = event.target.value.trim();
		setIsCodeValid( validateGoogleAnalyticsCode( code ) );
		handleFieldChange( 'code', code );
	};

	const recordSupportLinkClick = () => {
		trackTracksEvent( 'calypso_traffic_settings_google_support_click' );
	};

	const handleFieldFocus = () => {
		trackTracksEvent( 'calypso_google_analytics_key_field_focused', { path } );
		eventTracker( 'Focused Analytics Key Field' )();
	};

	const handleFieldKeypress = () => {
		if ( ! loggedGoogleAnalyticsModified ) {
			trackTracksEvent( 'calypso_google_analytics_key_field_modified', { path } );
			setLoggedGoogleAnalyticsModified( true );
		}
		uniqueEventTracker( 'Typed In Analytics Key Field' )();
	};

	const newProps = {
		...props,
		displayForm,
		handleCodeChange,
		handleFieldChange,
		handleFieldFocus,
		handleFieldKeypress,
		isCodeValid,
		isSubmitButtonDisabled,
		placeholderText,
		recordSupportLinkClick,
		setDisplayForm,
		isFreeWPCOM,
	};
	if ( props.siteIsJetpack && ! isFreeWPCOM ) {
		return <GoogleAnalyticsJetpackForm { ...newProps } />;
	}
	return <GoogleAnalyticsSimpleForm { ...newProps } />;
};

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isGoogleAnalyticsEligible = hasSiteAnalyticsFeature( state, site );
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
		isFreeWPCOM: isSiteWPCOMOnFreePlan( state, siteId ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps );

const getFormSettings = partialRight( pick, [ 'wga' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( GoogleAnalyticsForm );
