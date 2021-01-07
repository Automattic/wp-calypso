/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import user from 'calypso/lib/user';
import userSettings from 'calypso/lib/user-settings';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const withFormBase = ( WrappedComponent ) => {
	class EnhancedComponent extends React.Component {
		static displayName = `withFormBase(${ WrappedComponent.displayName || WrappedComponent.name })`;

		state = {
			redirect: false,
			submittingForm: false,
			showNotice: false,
		};

		componentDidMount() {
			userSettings.getSettings();
		}

		componentWillUnmount() {
			// Silently clean up unsavedSettings before unmounting
			userSettings.unsavedSettings = {};
		}

		componentDidUpdate() {
			this.showNotice();
		}

		getDisabledState = () => {
			return this.state.submittingForm;
		};

		showNotice() {
			if ( userSettings.initialized && this.state.showNotice ) {
				this.props.successNotice( this.props.translate( 'Settings saved successfully!' ), {
					id: 'form-base',
				} );
				this.state.showNotice = false;
			}
		}

		getSetting = ( settingName ) => {
			return userSettings.getSetting( settingName ) || '';
		};

		toggleSetting = ( event ) => {
			const { name } = event.currentTarget;
			userSettings.updateSetting( name, ! this.getSetting( name ) );
		};

		updateSetting = ( event ) => {
			const { name, value } = event.currentTarget;
			userSettings.updateSetting( name, value );
		};

		submitForm = ( event ) => {
			event.preventDefault();

			this.setState( { submittingForm: true } );
			userSettings.saveSettings(
				function ( error ) {
					if ( error ) {
						// handle error case here
						if ( error.message ) {
							this.props.errorNotice( error.message, { id: 'form-base' } );
						} else {
							this.props.errorNotice(
								this.props.translate( 'There was a problem saving your changes.' ),
								{ id: 'form-base' }
							);
						}
						this.setState( { submittingForm: false } );
					} else {
						this.props.markSaved && this.props.markSaved();

						if ( this.state && this.state.redirect ) {
							user()
								.clear()
								.then( () => {
									// Sometimes changes in settings require a url refresh to update the UI.
									// For example when the user changes the language.
									window.location = this.state.redirect + '?updated=success';
								} );
							return;
						}
						// if we set submittingForm too soon the UI updates before the response is handled
						this.setState( { showNotice: true, submittingForm: false } );
						this.showNotice();
					}
				}.bind( this )
			);
		};

		getFormBaseProps = () => ( {
			getDisabledState: this.getDisabledState,
			getSetting: this.getSetting,
			toggleSetting: this.toggleSetting,
			updateSetting: this.updateSetting,
			submitForm: this.submitForm,
			formState: this.state,
		} );

		render() {
			return <WrappedComponent { ...this.props } { ...this.getFormBaseProps() } />;
		}
	}

	return connect( null, { errorNotice, successNotice } )( localize( EnhancedComponent ) );
};

export default withFormBase;
