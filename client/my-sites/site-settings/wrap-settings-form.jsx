/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { flowRight, omit, keys, pick } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { protectForm } from 'lib/protect-form';
import trackForm from 'lib/track-form';
import {
	isRequestingSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
	getSiteSettings
} from 'state/site-settings/selectors';
import { getSiteTimezone } from 'state/selectors';
import {
	isRequestingJetpackSettings,
	isUpdatingJetpackSettings,
	isJetpackSettingsSaveSuccessful,
	getJetpackSettings
} from 'state/jetpack/settings/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { updateSettings } from 'state/jetpack/settings/actions';
import { removeNotice, successNotice, errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import QuerySiteSettings from 'components/data/query-site-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
		state = {
			uniqueEvents: {}
		};

		componentWillMount() {
			this.props.replaceFields( getFormSettings( this.props.settings ) );
		}

		componentWillReceiveProps( nextProps ) {
			if ( nextProps.siteId !== this.props.siteId ) {
				nextProps.clearDirtyFields();
			}

			if ( nextProps.settings !== this.props.settings ) {
				let newState = getFormSettings( nextProps.settings );
				//If we have any fields that the user has updated,
				//do not wipe out those fields from the poll update.
				newState = omit( newState, nextProps.dirtyFields );
				nextProps.replaceFields( newState );
			}

			if (
				this.props.isSavingSettings &&
				! nextProps.isSavingSettings
			) {
				if ( nextProps.isSaveRequestSuccessful ) {
					nextProps.successNotice( nextProps.translate( 'Settings saved!' ), { id: 'site-settings-save' } );
					nextProps.clearDirtyFields();
					nextProps.markSaved();
				} else {
					let text = nextProps.translate( 'There was a problem saving your changes. Please try again.' );
					switch ( nextProps.siteSettingsSaveError ) {
						case 'invalid_ip':
							text = nextProps.translate( 'One of your IP Addresses was invalid. Please try again.' );
							break;
					}
					nextProps.errorNotice( text, { id: 'site-settings-save' } );
				}
			}
		}

		// Some Utils
		handleSubmitForm = event => {
			if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
				event.preventDefault();
			}

			this.submitForm();
			this.props.trackEvent( 'Clicked Save Settings Button' );
		};

		submitForm = () => {
			const { fields, settingsFields, site, jetpackSettingsUISupported } = this.props;
			this.props.removeNotice( 'site-settings-save' );

			let settings = pick( fields, settingsFields.site );

			// Omit `timezone` since this value isn't used to save site settings data.
			settings = omit( settings, 'timezone' );

			this.props.saveSiteSettings( site.ID, settings );

			if ( jetpackSettingsUISupported ) {
				this.props.updateSettings( site.ID, pick( fields, settingsFields.jetpack ) );
			}
		};

		handleRadio = event => {
			const currentTargetName = event.currentTarget.name,
				currentTargetValue = event.currentTarget.value;

			this.props.updateFields( { [ currentTargetName ]: currentTargetValue } );
			this.props.markChanged();
		};

		handleToggle = name => () => {
			this.props.trackEvent( `Toggled ${ name }` );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
			this.props.markChanged();
		};

		onChangeField = field => event => {
			this.props.updateFields( {
				[ field ]: event.target.value
			} );
			this.props.markChanged();
		};

		uniqueEventTracker = message => () => {
			if ( this.state.uniqueEvents[ message ] ) {
				return;
			}
			const uniqueEvents = {
				...this.state.uniqueEvents,
				[ message ]: true,
			};
			this.setState( { uniqueEvents } );
			this.props.trackEvent( message );
		};

		render() {
			const utils = {
				handleRadio: this.handleRadio,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				onChangeField: this.onChangeField,
				submitForm: this.submitForm,
				uniqueEventTracker: this.uniqueEventTracker,
			};

			return (
				<div>
					<QuerySiteSettings siteId={ this.props.siteId } />
					{
						this.props.jetpackSettingsUISupported &&
						<QueryJetpackSettings siteId={ this.props.siteId } />
					}
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}
	}

	const connectComponent = connect(
		state => {
			const siteId = getSelectedSiteId( state );
			let isSavingSettings = isSavingSiteSettings( state, siteId );
			let isSaveRequestSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
			let settings = getSiteSettings( state, siteId );
			let isRequestingSettings = isRequestingSiteSettings( state, siteId ) && ! settings;
			const siteSettingsSaveError = getSiteSettingsSaveError( state, siteId );
			const settingsFields = {
				site: keys( settings ),
			};

			const isJetpack = isJetpackSite( state, siteId );
			const jetpackSettingsUISupported = isJetpack && siteSupportsJetpackSettingsUi( state, siteId );
			if ( jetpackSettingsUISupported ) {
				const jetpackSettings = getJetpackSettings( state, siteId );
				isSavingSettings = isSavingSettings || isUpdatingJetpackSettings( state, siteId );
				isSaveRequestSuccessful = isSaveRequestSuccessful && isJetpackSettingsSaveSuccessful( state, siteId );
				settings = { ...settings, ...jetpackSettings };
				settingsFields.jetpack = keys( jetpackSettings );
				isRequestingSettings = isRequestingSettings || ( isRequestingJetpackSettings( state, siteId ) && ! jetpackSettings );
			}

			// Add custom `timezone` field
			settings = { ...settings, timezone: getSiteTimezone( state, siteId ) };
			settingsFields.site.push( 'timezone' );

			return {
				isRequestingSettings,
				isSavingSettings,
				isSaveRequestSuccessful,
				siteSettingsSaveError,
				settings,
				settingsFields,
				siteId,
				jetpackSettingsUISupported
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators( {
				errorNotice,
				recordTracksEvent,
				removeNotice,
				saveSiteSettings,
				successNotice,
				updateSettings,
			}, dispatch );
			const trackEvent = name => dispatch( recordGoogleEvent( 'Site Settings', name ) );
			return {
				...boundActionCreators,
				eventTracker: message => () => trackEvent( message ),
				trackEvent,
			};
		}
	);

	return flowRight(
		connectComponent,
		localize,
		trackForm,
		protectForm
	)( WrappedSettingsForm );
};

export default wrapSettingsForm;
