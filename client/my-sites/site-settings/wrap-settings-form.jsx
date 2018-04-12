/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { flowRight, isEqual, keys, omit, pick, isNaN } from 'lodash';
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
	getSiteSettings,
} from 'state/site-settings/selectors';
import {
	isRequestingJetpackSettings,
	isUpdatingJetpackSettings,
	isJetpackSettingsSaveFailure,
	getJetpackSettings,
} from 'state/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { saveJetpackSettings } from 'state/jetpack/settings/actions';
import { removeNotice, successNotice, errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	siteSupportsJetpackSettingsUi,
} from 'state/sites/selectors';
import QuerySiteSettings from 'components/data/query-site-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
		state = {
			uniqueEvents: {},
		};

		componentWillMount() {
			this.props.replaceFields( getFormSettings( this.props.settings ) );
		}

		componentDidUpdate( prevProps ) {
			if ( prevProps.siteId !== this.props.siteId ) {
				this.props.clearDirtyFields();
				const newSiteFields = getFormSettings( this.props.settings );
				this.props.replaceFields( newSiteFields, undefined, false );
			} else if (
				! isEqual( prevProps.settings, this.props.settings ) ||
				! isEqual( prevProps.fields, this.props.fields )
			) {
				this.updateDirtyFields();
			}

			if ( ! this.props.isSavingSettings && prevProps.isSavingSettings ) {
				if (
					this.props.isSaveRequestSuccessful &&
					( this.props.isJetpackSaveRequestSuccessful || ! this.props.jetpackSettingsUISupported )
				) {
					this.props.successNotice( this.props.translate( 'Settings saved!' ), {
						id: 'site-settings-save',
					} );
					// Upon failure to save Jetpack Settings, don't show an error message,
					// since the JP settings data layer already does that for us.
				} else if ( ! this.props.isSaveRequestSuccessful ) {
					let text = this.props.translate(
						'There was a problem saving your changes. Please try again.'
					);
					switch ( this.props.siteSettingsSaveError ) {
						case 'invalid_ip':
							text = this.props.translate(
								'One of your IP Addresses was invalid. Please try again.'
							);
							break;
					}
					this.props.errorNotice( text, { id: 'site-settings-save' } );
				}
			}
		}

		updateDirtyFields() {
			const currentFields = this.props.fields;
			const persistedFields = getFormSettings( this.props.settings );

			// Compute the dirty fields by comparing the persisted and the current fields
			const previousDirtyFields = this.props.dirtyFields;
			/*eslint-disable eqeqeq*/
			const nextDirtyFields = previousDirtyFields.filter(
				field => ! ( currentFields[ field ] == persistedFields[ field ] )
			);
			/*eslint-enable eqeqeq*/

			// Update the dirty fields state without updating their values
			if ( nextDirtyFields.length === 0 ) {
				this.props.markSaved();
			} else {
				this.props.markChanged();
			}
			this.props.clearDirtyFields();
			this.props.updateFields( pick( currentFields, nextDirtyFields ) );

			// Set the new non dirty fields
			const nextNonDirtyFields = omit( persistedFields, nextDirtyFields );
			this.props.replaceFields( nextNonDirtyFields );
		}

		// Some Utils
		handleSubmitForm = event => {
			const { dirtyFields, fields, trackTracksEvent } = this.props;

			if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
				event.preventDefault();
			}

			dirtyFields.map( function( value ) {
				switch ( value ) {
					case 'blogdescription':
						trackTracksEvent( 'calypso_settings_site_tagline_updated' );
						break;
					case 'blogname':
						trackTracksEvent( 'calypso_settings_site_title_updated' );
						break;
					case 'blog_public':
						trackTracksEvent( 'calypso_settings_site_privacy_updated', {
							privacy: fields.blog_public,
						} );
						break;
					case 'wga':
						trackTracksEvent( 'calypso_seo_settings_google_analytics_updated' );
						break;
				}
			} );

			this.submitForm();
			this.props.trackEvent( 'Clicked Save Settings Button' );
		};

		submitForm = () => {
			const {
				fields,
				jetpackFieldsToUpdate,
				jetpackSiteSettingsAPIVersion,
				settingsFields,
				siteId,
				siteIsJetpack,
				jetpackSettingsUISupported,
			} = this.props;
			this.props.removeNotice( 'site-settings-save' );

			// Support site settings for older Jetpacks as needed
			const siteFields = pick( fields, settingsFields.site );
			const apiVersion = siteIsJetpack ? jetpackSiteSettingsAPIVersion : '1.4';
			this.props.saveSiteSettings( siteId, { ...siteFields, apiVersion } );
			if ( jetpackSettingsUISupported ) {
				this.props.saveJetpackSettings( siteId, jetpackFieldsToUpdate );
			}
		};

		handleRadio = event => {
			const currentTargetName = event.currentTarget.name,
				currentTargetValue = event.currentTarget.value;

			this.props.trackEvent( `Set ${ currentTargetName } to ${ currentTargetValue }` );
			this.props.updateFields( { [ currentTargetName ]: currentTargetValue } );
		};

		handleAutosavingRadio = ( name, value ) => () => {
			const { fields } = this.props;
			if ( fields[ name ] === value ) {
				return;
			}

			this.props.trackEvent( `Set ${ name } to ${ value }` );
			this.props.updateFields( { [ name ]: value }, () => {
				this.submitForm();
			} );
		};

		handleSelect = event => {
			const { name, value } = event.currentTarget;
			// Attempt to cast numeric fields value to int
			const parsedValue = parseInt( value, 10 );
			this.props.updateFields( { [ name ]: isNaN( parsedValue ) ? value : parsedValue } );
		};

		handleToggle = name => () => {
			this.props.trackEvent( `Toggled ${ name }` );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		handleAutosavingToggle = name => () => {
			this.props.trackEvent( `Toggled ${ name }` );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] }, () => {
				this.submitForm();
			} );
		};

		onChangeField = field => event => {
			this.props.updateFields( {
				[ field ]: event.target.value,
			} );
		};

		setFieldValue = ( field, value, autosave = false ) => {
			this.props.updateFields(
				{
					[ field ]: value,
				},
				() => {
					autosave && this.submitForm();
				}
			);
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
				handleSelect: this.handleSelect,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				handleAutosavingToggle: this.handleAutosavingToggle,
				handleAutosavingRadio: this.handleAutosavingRadio,
				onChangeField: this.onChangeField,
				setFieldValue: this.setFieldValue,
				submitForm: this.submitForm,
				uniqueEventTracker: this.uniqueEventTracker,
			};

			return (
				<div>
					<QuerySiteSettings siteId={ this.props.siteId } />
					{ this.props.jetpackSettingsUISupported && (
						<QueryJetpackSettings siteId={ this.props.siteId } />
					) }
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}
	}

	const connectComponent = connect(
		( state, { fields } ) => {
			const siteId = getSelectedSiteId( state );
			let isSavingSettings = isSavingSiteSettings( state, siteId );
			let isSaveRequestSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
			let settings = getSiteSettings( state, siteId );
			let isRequestingSettings = isRequestingSiteSettings( state, siteId ) && ! settings;
			let isJetpackSaveRequestSuccessful;
			let jetpackFieldsToUpdate;
			const siteSettingsSaveError = getSiteSettingsSaveError( state, siteId );
			const settingsFields = {
				site: keys( settings ),
			};

			const isJetpack = isJetpackSite( state, siteId );
			const jetpackSettingsUISupported =
				isJetpack && siteSupportsJetpackSettingsUi( state, siteId );
			let jetpackSiteSettingsAPIVersion = false;
			if ( isJetpack ) {
				if ( isJetpackMinimumVersion( state, siteId, '5.4-beta3' ) ) {
					jetpackSiteSettingsAPIVersion = '1.3';
				}
				if ( isJetpackMinimumVersion( state, siteId, '5.6-beta2' ) ) {
					jetpackSiteSettingsAPIVersion = '1.4';
				}
			}

			if ( jetpackSettingsUISupported ) {
				const jetpackSettings = getJetpackSettings( state, siteId );
				settings = { ...settings, ...jetpackSettings };
				settingsFields.jetpack = keys( jetpackSettings );
				const fieldsToUpdate = /^error_/.test( fields.lang_id )
					? omit( fields, 'lang_id' )
					: fields;
				jetpackFieldsToUpdate = pick( fieldsToUpdate, settingsFields.jetpack );
				isSavingSettings =
					isSavingSettings || isUpdatingJetpackSettings( state, siteId, jetpackFieldsToUpdate );
				isJetpackSaveRequestSuccessful = ! isJetpackSettingsSaveFailure(
					state,
					siteId,
					jetpackFieldsToUpdate
				);
				isRequestingSettings =
					isRequestingSettings ||
					( isRequestingJetpackSettings( state, siteId ) && ! jetpackSettings );
			}

			return {
				isJetpackSaveRequestSuccessful,
				isRequestingSettings,
				isSavingSettings,
				isSaveRequestSuccessful,
				jetpackFieldsToUpdate,
				jetpackSiteSettingsAPIVersion,
				siteIsJetpack: isJetpack,
				siteSettingsSaveError,
				settings,
				settingsFields,
				siteId,
				jetpackSettingsUISupported,
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators(
				{
					errorNotice,
					recordTracksEvent,
					removeNotice,
					saveSiteSettings,
					successNotice,
					saveJetpackSettings,
				},
				dispatch
			);
			const trackEvent = name => dispatch( recordGoogleEvent( 'Site Settings', name ) );
			const trackTracksEvent = ( name, props ) => dispatch( recordTracksEvent( name, props ) );
			return {
				...boundActionCreators,
				eventTracker: message => () => trackEvent( message ),
				trackTracksEvent,
				trackEvent,
			};
		}
	);

	return flowRight( trackForm, protectForm, connectComponent, localize )( WrappedSettingsForm );
};

export default wrapSettingsForm;
