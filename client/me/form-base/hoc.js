/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:me:form-base' );

/**
 * Internal dependencies
 */
import notices from 'notices';
import userFactory from 'lib/user';

const user = userFactory();

const formBase = WrappedComponent => {
	return class FormBaseComponent extends Component {
		static propTypes = {
			userSettings: PropTypes.object.isRequired,
			showNoticeInitially: PropTypes.bool,
			translate: PropTypes.func.isRequired,
		};

		constructor( props ) {
			super( props );
			this.state = {
				redirect: false,
				submittingForm: false,
				changingUsername: false,
				usernameAction: 'new',
				showNotice: false,
			};
		}

		// lifecycle
		componentDidMount() {
			this.props.userSettings.getSettings();
		}

		componentWillUnmount() {
			// Silently clean up unsavedSettings before unmounting
			this.props.userSettings.unsavedSettings = {};
		}

		componentWillReceiveProps( nextProp ) {
			if ( nextProp.showNoticeInitially ) {
				this.setState( { showNotice: nextProp.showNoticeInitially } );
			}
		}

		componentWillUpdate() {
			this.showNotice();
		}

		// internals
		showNotice() {
			if ( this.props.userSettings.initialized && this.state.showNotice ) {
				notices.clearNotices( 'notices' );
				notices.success( this.props.translate( 'Settings saved successfully!' ) );
				this.setState( { showNotice: false } );
			}
		}

		// passed down to wrapped component
		getDisabledState = () => {
			return this.state.submittingForm;
		};

		isSubmittingForm = () => {
			return this.state.isSubmittingForm;
		};

		getSetting = settingName => {
			return this.props.userSettings.getSetting( settingName ) || '';
		};

		toggleSetting = event => {
			const { name } = event.currentTarget;
			this.props.userSettings.updateSetting( name, ! this.getSetting( name ) );
		};

		updateSetting = event => {
			const { name, value } = event.currentTarget;
			this.props.userSettings.updateSetting( name, value );
		};

		submitForm = event => {
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

					if ( this.state && this.state.redirect ) {
						user.clear( () => {
							// Sometimes changes in settings require a url refresh to update the UI.
							// For example when the user changes the language.
							window.location = this.state.redirect + '?updated=success';
						} );
						return;
					}

					this.setState( { showNotice: true } );
					this.showNotice();
					debug( 'Settings saved successfully ' + JSON.stringify( response ) );
				}
			} );
		};

		render() {
			return (
				<WrappedComponent
					getDisabledState={ this.getDisabledState }
					isSubmittingForm={ this.isSubmittingForm }
					getSetting={ this.getSetting }
					toggleSetting={ this.toggleSetting }
					updateSetting={ this.updateSetting }
					submitForm={ this.submitForm }
					{ ...this.props }
				/>
			);
		}
	};
};

export default formBase;
