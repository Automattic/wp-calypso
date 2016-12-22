/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { flowRight, omit, memoize } from 'lodash';
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
	getSiteSettings
} from 'state/site-settings/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { removeNotice, successNotice, errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import QuerySiteSettings from 'components/data/query-site-settings';

const wrapSettingsForm = getFormSettings => SettingsForm => {
	class WrappedSettingsForm extends Component {
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
					let text;
					switch ( nextProps.saveRequestError.error ) {
						case 'invalid_ip':
							text = nextProps.translate( 'One of your IP Addresses was invalid. Please try again.' );
							break;
						default:
							text = nextProps.translate( 'There was a problem saving your changes. Please try again.' );
					}
					nextProps.errorNotice( text, { id: 'site-settings-save' } );
				}
			}
		}

		render() {
			const utils = {
				handleRadio: this.handleRadio,
				handleSubmitForm: this.handleSubmitForm,
				handleToggle: this.handleToggle,
				onChangeField: this.onChangeField,
				submitForm: this.submitForm,
			};

			return (
				<div>
					<QuerySiteSettings siteId={ this.props.siteId } />
					<SettingsForm { ...this.props } { ...utils } />
				</div>
			);
		}

		// Some Utils
		handleSubmitForm = event => {
			if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
				event.preventDefault();
			}

			this.submitForm();
			this.props.trackClick( 'Save Settings Button' );
		};

		submitForm = () => {
			const { fields, site } = this.props;
			this.props.removeNotice( 'site-settings-save' );
			this.props.saveSiteSettings( site.ID, fields );
		}

		handleRadio = event => {
			const currentTargetName = event.currentTarget.name,
				currentTargetValue = event.currentTarget.value;

			this.props.updateFields( { [ currentTargetName ]: currentTargetValue } );
		};

		handleToggle = name => () => {
			this.props.trackToggle( name );
			this.props.updateFields( { [ name ]: ! this.props.fields[ name ] } );
		};

		onChangeField = field => event => {
			const { updateFields } = this.props;
			updateFields( {
				[ field ]: event.target.value
			} );
		};

	}

	const connectComponent = connect(
		state => {
			const siteId = getSelectedSiteId( state );
			const isRequestingSettings = isRequestingSiteSettings( state, siteId );
			const isSavingSettings = isSavingSiteSettings( state, siteId );
			const isSaveRequestSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
			const settings = getSiteSettings( state, siteId );
			return {
				isRequestingSettings: isRequestingSettings && ! settings,
				isSavingSettings,
				isSaveRequestSuccessful,
				settings,
				siteId
			};
		},
		dispatch => {
			const boundActionCreators = bindActionCreators( {
				errorNotice,
				recordTracksEvent,
				removeNotice,
				saveSiteSettings,
				successNotice,
			}, dispatch );
			const trackClick = name => dispatch( recordGoogleEvent( 'Site Settings', `Clicked ${ name }` ) );
			const trackSelect = name => dispatch( recordGoogleEvent( 'Site Settings', `Selected ${ name }` ) );
			const trackToggle = name => dispatch( recordGoogleEvent( 'Site Settings', `Toggled ${ name }` ) );
			const trackType = memoize( name => dispatch( recordGoogleEvent( 'Site Settings', `Typed in ${ name }` ) ) );
			return {
				...boundActionCreators,
				clickTracker: message => () => trackClick( message ),
				selectTracker: message => () => trackSelect( message ),
				typeTracker: message => () => trackType( message ),
				trackClick,
				trackSelect,
				trackToggle,
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
