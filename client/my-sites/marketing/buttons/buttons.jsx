/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ButtonsAppearance from './appearance';
import ButtonsOptions from './options';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QuerySiteSettings from 'components/data/query-site-settings';
import QuerySharingButtons from 'components/data/query-sharing-buttons';
import { saveSiteSettings } from 'state/site-settings/actions';
import { saveSharingButtons } from 'state/sites/sharing-buttons/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSiteSettings,
	isSavingSiteSettings,
	isSiteSettingsSaveSuccessful,
} from 'state/site-settings/selectors';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import getSharingButtons from 'state/selectors/get-sharing-buttons';
import isSavingSharingButtons from 'state/selectors/is-saving-sharing-buttons';
import isSharingButtonsSaveSuccessful from 'state/selectors/is-sharing-buttons-save-successful';
import { isJetpackSite } from 'state/sites/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { activateModule } from 'state/jetpack/modules/actions';
import { protectForm } from 'lib/protect-form';

class SharingButtons extends Component {
	state = {
		values: {},
		buttonsPendingSave: null,
	};

	static propTypes = {
		buttons: PropTypes.array,
		isSaving: PropTypes.bool,
		isSaveSettingsSuccessful: PropTypes.bool,
		isSaveButtonsSuccessful: PropTypes.bool,
		markSaved: PropTypes.func,
		markChanged: PropTypes.func,
		settings: PropTypes.object,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	saveChanges = ( event ) => {
		const { isJetpack, isLikesModuleActive, siteId, path } = this.props;

		event.preventDefault();

		this.props.saveSiteSettings( this.props.siteId, this.state.values );
		if ( this.state.buttonsPendingSave ) {
			this.props.saveSharingButtons( this.props.siteId, this.state.buttonsPendingSave );
		}
		this.props.recordTracksEvent( 'calypso_sharing_buttons_save_changes_click', { path } );
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Save Changes Button' );

		if ( ! isJetpack || isLikesModuleActive !== false ) {
			return;
		}

		const updatedSettings = this.getUpdatedSettings();
		if ( updatedSettings.disabled_likes ) {
			return;
		}

		this.props.activateModule( siteId, 'likes', true );
	};

	handleChange = ( option, value ) => {
		const pairs = undefined === value ? option : { [ option ]: value };
		this.props.markChanged();
		this.setState( {
			values: Object.assign( {}, this.state.values, pairs ),
		} );
	};

	handleButtonsChange = ( buttons ) => {
		this.props.markChanged();
		this.setState( { buttonsPendingSave: buttons } );
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// Save request has been performed
		if ( this.props.isSaving && ! nextProps.isSaving ) {
			if (
				nextProps.isSaveSettingsSuccessful &&
				( nextProps.isSaveButtonsSuccessful || ! this.state.buttonsPendingSave )
			) {
				nextProps.successNotice( nextProps.translate( 'Settings saved successfully!' ) );
				nextProps.markSaved();
				this.setState( {
					values: {},
					buttonsPendingSave: null,
				} );
			} else {
				nextProps.errorNotice(
					nextProps.translate( 'There was a problem saving your changes. Please, try again.' )
				);
			}
		}
	}

	getUpdatedSettings() {
		const { isJetpack, isLikesModuleActive, settings } = this.props;
		const disabledSettings =
			isJetpack && isLikesModuleActive === false
				? {
						// Like button should be disabled if the Likes Jetpack module is deactivated.
						disabled_likes: true,
				  }
				: {};

		return Object.assign( {}, settings, disabledSettings, this.state.values );
	}

	render() {
		const { buttons, isJetpack, isSaving, settings, siteId } = this.props;
		const updatedSettings = this.getUpdatedSettings();
		const updatedButtons = this.state.buttonsPendingSave || buttons;

		return (
			<form
				onSubmit={ this.saveChanges }
				id="sharing-buttons"
				className="buttons__sharing-settings buttons__sharing-buttons"
			>
				<PageViewTracker
					path="/marketing/sharing-buttons/:site"
					title="Marketing > Sharing Buttons"
				/>
				<QuerySiteSettings siteId={ siteId } />
				<QuerySharingButtons siteId={ siteId } />
				{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }
				<ButtonsAppearance
					buttons={ updatedButtons }
					values={ updatedSettings }
					onChange={ this.handleChange }
					onButtonsChange={ this.handleButtonsChange }
					initialized={ !! buttons && !! settings }
					saving={ isSaving }
				/>
				<ButtonsOptions
					settings={ updatedSettings }
					onChange={ this.handleChange }
					saving={ isSaving }
				/>
			</form>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const settings = getSiteSettings( state, siteId );
		const buttons = getSharingButtons( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const isLikesModuleActive = isJetpackModuleActive( state, siteId, 'likes' );
		const isSavingSettings = isSavingSiteSettings( state, siteId );
		const isSavingButtons = isSavingSharingButtons( state, siteId );
		const isSaveSettingsSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
		const isSaveButtonsSuccessful = isSharingButtonsSaveSuccessful( state, siteId );
		const path = getCurrentRouteParameterized( state, siteId );

		return {
			isJetpack,
			isLikesModuleActive,
			isSaving: isSavingSettings || isSavingButtons,
			isSaveSettingsSuccessful,
			isSaveButtonsSuccessful,
			settings,
			buttons,
			siteId,
			path,
		};
	},
	{
		activateModule,
		errorNotice,
		recordGoogleEvent,
		recordTracksEvent,
		saveSharingButtons,
		saveSiteSettings,
		successNotice,
	}
);

export default flowRight( connectComponent, protectForm, localize )( SharingButtons );
