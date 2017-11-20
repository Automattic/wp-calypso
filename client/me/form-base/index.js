/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:me:form-base' );

/**
 * Internal dependencies
 */
import notices from 'notices';

export default {
	componentDidMount: function() {
		this.props.userSettings.getSettings();
	},

	componentWillUnmount: function() {
		// Silently clean up unsavedSettings before unmounting
		this.props.userSettings.unsavedSettings = {};
	},

	getDisabledState: function() {
		return this.state.submittingForm;
	},

	componentWillReceiveProps: function( nextProp ) {
		if ( nextProp.showNoticeInitially ) {
			this.setState( { showNotice: nextProp.showNoticeInitially } );
		}
	},

	componentWillUpdate: function() {
		this.showNotice();
	},

	getInitialState: function() {
		return {
			redirect: false,
			submittingForm: false,
			changingUsername: false,
			usernameAction: 'new',
			showNotice: false,
		};
	},

	showNotice: function() {
		if ( this.props.userSettings.initialized && this.state.showNotice ) {
			notices.clearNotices( 'notices' );
			notices.success( this.props.translate( 'Settings saved successfully!' ) );
			this.state.showNotice = false;
		}
	},

	getSetting: function( settingName ) {
		return this.props.userSettings.getSetting( settingName ) || '';
	},

	toggleSetting: function( event ) {
		const { name } = event.currentTarget;
		this.props.userSettings.updateSetting( name, ! this.getSetting( name ) );
	},

	updateSetting: function( event ) {
		const { name, value } = event.currentTarget;
		this.props.userSettings.updateSetting( name, value );
	},

	submitForm: function( event ) {
		event.preventDefault();
		debug( 'Submitting form' );

		this.setState( { submittingForm: true } );
		this.props.userSettings.saveSettings(
			function( error, response ) {
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
						// Sometimes changes in settings require a url refresh to update the UI.
						// For example when the user changes the language.
						window.location = this.state.redirect + '?updated=success';
						return;
					}

					this.setState( { showNotice: true } );
					this.showNotice();
					debug( 'Settings saved successfully ' + JSON.stringify( response ) );
				}
			}.bind( this )
		);
	},
};
