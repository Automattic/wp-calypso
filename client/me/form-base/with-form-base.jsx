/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import user from 'calypso/lib/user';
import userSettings from 'calypso/lib/user-settings';

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

		UNSAFE_componentWillReceiveProps( nextProp ) {
			if ( nextProp.showNoticeInitially ) {
				this.setState( { showNotice: nextProp.showNoticeInitially } );
			}
		}

		UNSAFE_componentWillUpdate() {
			this.showNotice();
		}

		getDisabledState = () => {
			return this.state.submittingForm;
		};

		showNotice() {
			if ( userSettings.initialized && this.state.showNotice ) {
				notices.clearNotices( 'notices' );
				notices.success( this.props.translate( 'Settings saved successfully!' ) );
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
							notices.error( error.message );
						} else {
							notices.error( this.props.translate( 'There was a problem saving your changes.' ) );
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

	return localize( EnhancedComponent );
};

export default withFormBase;
