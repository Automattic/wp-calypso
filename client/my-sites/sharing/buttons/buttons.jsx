/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { flowRight } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ButtonsAppearance from './appearance';
import ButtonsOptions from './options';
import QuerySiteSettings from 'components/data/query-site-settings';
import QuerySharingButtons from 'components/data/query-sharing-buttons';
import QueryPostTypes from 'components/data/query-post-types';
import { saveSiteSettings } from 'state/site-settings/actions';
import { saveSharingButtons } from 'state/sites/sharing-buttons/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings, isSavingSiteSettings, isSiteSettingsSaveSuccessful } from 'state/site-settings/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import { getSharingButtons, isSavingSharingButtons, isSharingButtonsSaveSuccessful } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { protectForm } from 'lib/protect-form';

class SharingButtons extends Component {
	state = {
		values: {},
		buttonsPendingSave: null
	};

	static propTypes = {
		buttons: PropTypes.array,
		isSaving: PropTypes.bool.isRequired,
		isSaveSettingsSuccessful: PropTypes.bool.isRequired,
		isSaveButtonsSuccessful: PropTypes.bool.isRequired,
		postTypes: PropTypes.object,
		markSaved: PropTypes.func.isRequired,
		markChanged: PropTypes.func.isRequired,
		settings: PropTypes.object,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	saveChanges = event => {
		event.preventDefault();
		this.props.saveSiteSettings( this.props.siteId, this.state.values );
		if ( this.state.buttonsPendingSave ) {
			this.props.saveSharingButtons( this.props.siteId, this.state.buttonsPendingSave );
		}
		this.props.recordGoogleEvent( 'Sharing', 'Clicked Save Changes Button' );
	};

	handleChange = ( option, value ) => {
		const pairs = undefined === value
			? option
			: { [ option ]: value };
		this.props.markChanged();
		this.setState( {
			values: Object.assign( {}, this.state.values, pairs )
		} );
	};

	handleButtonsChange = buttons => {
		this.props.markChanged();
		this.setState( { buttonsPendingSave: buttons } );
	};

	componentWillReceiveProps( nextProps ) {
		// Save request has been performed
		if (
			this.props.isSaving &&
			! nextProps.isSaving
		) {
			if (
				nextProps.isSaveSettingsSuccessful &&
				( nextProps.isSaveButtonsSuccessful || ! this.state.buttonsPendingSave )
			) {
				nextProps.successNotice( nextProps.translate( 'Settings saved successfully!' ) );
				nextProps.markSaved();
				this.setState( {
					values: {},
					buttonsPendingSave: null
				} );
			} else {
				nextProps.errorNotice( nextProps.translate( 'There was a problem saving your changes. Please, try again.' ) );
			}
		}
	}

	render() {
		const { buttons, isSaving, postTypes, settings, siteId } = this.props;
		const updatedSettings = Object.assign( {}, settings, this.state.values );
		const updatedButtons = this.state.buttonsPendingSave || buttons;

		return (
			<form onSubmit={ this.saveChanges } id="sharing-buttons" className="sharing-settings sharing-buttons">
				<QuerySiteSettings siteId={ siteId } />
				<QueryPostTypes siteId={ siteId } />
				<QuerySharingButtons siteId={ siteId } />
				<ButtonsAppearance
					buttons={ updatedButtons }
					values={ updatedSettings }
					onChange={ this.handleChange }
					onButtonsChange={ this.handleButtonsChange }
					initialized={ !! buttons && !! settings }
					saving={ isSaving } />
				<ButtonsOptions
					postTypes={ Object.values( postTypes ) }
					buttons={ buttons }
					values={ updatedSettings }
					onChange={ this.handleChange }
					initialized={ !! postTypes && !! settings }
					saving={ isSaving } />
			</form>
		);
	}
}

const connectComponent = connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const settings = getSiteSettings( state, siteId );
		const postTypes = getPostTypes( state, siteId );
		const buttons = getSharingButtons( state, siteId );
		const isSavingSettings = isSavingSiteSettings( state, siteId );
		const isSavingButtons = isSavingSharingButtons( state, siteId );
		const isSaveSettingsSuccessful = isSiteSettingsSaveSuccessful( state, siteId );
		const isSaveButtonsSuccessful = isSharingButtonsSaveSuccessful( state, siteId );

		return {
			isSaving: isSavingSettings || isSavingButtons,
			isSaveSettingsSuccessful,
			isSaveButtonsSuccessful,
			postTypes,
			settings,
			buttons,
			siteId
		};
	},
	{ errorNotice, recordGoogleEvent, saveSiteSettings, saveSharingButtons, successNotice }
);

export default flowRight(
	connectComponent,
	protectForm,
	localize,
)( SharingButtons );
