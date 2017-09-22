/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'notices';
import { requestUser } from 'state/users/actions';

const debug = debugModule( 'calypso:me:form-base' );

export default FormComponent => {
	class FormBase extends Component {
		static propTypes = {
			userSettings: PropTypes.object.isRequired,
			markSaved: PropTypes.func,
		};

		state = {
			redirect: false,
			submittingForm: false,
			changingUsername: false,
			usernameAction: 'new',
			showNotice: false,
		};

		componentDidMount() {
			this.props.userSettings.getSettings();
			// TODO: move user settings to the store
			this.props.userSettings.on( 'change', this.refresh );
		}

		componentWillUnmount() {
			// Silently clean up unsavedSettings before unmounting
			this.props.userSettings.unsavedSettings = {};
			this.props.userSettings.off( 'change', this.refresh );
		}

		componentWillReceiveProps( nextProp ) {
			if ( nextProp.showNoticeInitially ) {
				this.setState( { showNotice: nextProp.showNoticeInitially } );
			}
		}

		componentWillUpdate() {
			this.showNotice();
		}

		getDisabledState = () => {
			return this.state.submittingForm;
		};

		refresh = () => {
			this.forceUpdate();
		};

		showNotice = () => {
			if ( this.props.userSettings.initialized && this.state.showNotice ) {
				notices.clearNotices( 'notices' );
				notices.success( this.props.translate( 'Settings saved successfully!' ) );
				this.state.showNotice = false;
			}
		};

		valueLink = ( settingName ) => {
			return {
				value: this.props.userSettings.getSetting( settingName ),
				requestChange: value => this.props.userSettings.updateSetting( settingName, value )
			};
		};

		submitForm = ( event ) => {
			event.preventDefault();
			debug( 'Submitting form' );

			this.setState( { submittingForm: true } );

			this.props.userSettings.saveSettings( ( error, response ) => {
				this.setState( { submittingForm: false } );
				if ( error ) {
					debug( 'Error saving settings: ' + JSON.stringify( error ) );

					// handle error case here
					if ( error.message ) {
						notices.error( error.message );
					} else {
						notices.error( this.props.translate( 'There was a problem saving your changes.' ) );
					}
				} else {
					this.props.markSaved && this.props.markSaved();

					this.props.requestUser();

					if ( this.state && this.state.redirect ) {
						// Sometimes changes in settings require a url refresh to update the UI.
						// For example when the user changes the language.
						window.location = this.state.redirect + '?updated=success';
						return;
					}

					this.setState( { showNotice: true } );
					this.showNotice();
					debug( 'Settings saved successfully ' + JSON.stringify( response ) );
				}
			} );
		};

		render() {
			const formProps = {
				...this.props,
				...this.state,
				getDisabledState: this.getDisabledState,
				showNotice: this.showNotice,
				submitForm: this.submitForm,
				valueLink: this.valueLink,
			};
			return <FormComponent { ...formProps } />;
		}
	}

	return connect(
		null,
		{
			requestUser,
		}
	)( localize( FormBase ) );
};
