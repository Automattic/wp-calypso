import { FEATURE_GOOGLE_ANALYTICS } from '@automattic/calypso-products';
import { pick } from 'lodash';
import { useState } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getFilteredAndSortedPlugins } from 'calypso/state/plugins/installed/selectors-ts';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import getJetpackModule from 'calypso/state/selectors/get-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import wrapSettingsForm from '../wrap-settings-form';
import GoogleAnalyticsJetpackForm from './form-google-analytics-jetpack';
import GoogleAnalyticsSimpleForm from './form-google-analytics-simple';

import './style.scss';

const validateGoogleAnalyticsCode = ( code ) =>
	! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i );
export const GoogleAnalyticsForm = ( props ) => {
	const {
		isRequestingSettings,
		isSavingSettings,
		translate,
		fields,
		updateFields,
		trackTracksEvent,
		eventTracker,
		uniqueEventTracker,
		path,
		isAtomic,
		isJetpackModuleAvailable,
		jetpackModuleActive,
		isGoogleAnalyticsEligible,
		site,
		siteIsJetpack,
	} = props;
	const [ isCodeValid, setIsCodeValid ] = useState( true );
	const [ loggedGoogleAnalyticsModified, setLoggedGoogleAnalyticsModified ] = useState( false );
	const [ displayForm, setDisplayForm ] = useState( false );
	const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';

	const googleAnalyticsEnabled = site && ( ! siteIsJetpack || jetpackModuleActive );
	const enableForm =
		isGoogleAnalyticsEligible && ( googleAnalyticsEnabled || fields?.wga?.is_active );
	const isSubmitButtonDisabled =
		isRequestingSettings || isSavingSettings || ! isCodeValid || ! enableForm;

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
		isAtomic,
		enableForm,
	};

	if ( ( props.siteIsJetpack && ! isAtomic ) || ( isAtomic && isGoogleAnalyticsEligible ) ) {
		// Google Analytics module is not available (important distinction from not active)
		if (
			! isJetpackModuleAvailable &&
			( ! fields.hasOwnProperty( 'wga' ) || ! fields.wga.hasOwnProperty( 'is_active' ) )
		) {
			return null;
		}
		return <GoogleAnalyticsJetpackForm { ...newProps } />;
	}
	return <GoogleAnalyticsSimpleForm { ...newProps } />;
};

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isGoogleAnalyticsEligible = siteHasFeature( state, siteId, FEATURE_GOOGLE_ANALYTICS );
	const isJetpackModuleAvailable = Boolean( getJetpackModule( state, siteId, 'google-analytics' ) );
	const jetpackModuleActive = isJetpackModuleActive( state, siteId, 'google-analytics' );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const sitePlugins = site ? getFilteredAndSortedPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		path,
		showUpgradeNudge: ! isGoogleAnalyticsEligible,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
		jetpackModuleActive,
		isJetpackModuleAvailable,
		isAtomic: isAtomicSite( state, siteId ),
		isGoogleAnalyticsEligible,
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps );

const getFormSettings = ( settings ) => pick( settings, [ 'wga' ] );

export default connectComponent( wrapSettingsForm( getFormSettings )( GoogleAnalyticsForm ) );
