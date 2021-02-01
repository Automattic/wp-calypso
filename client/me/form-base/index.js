/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:me:form-base' );

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import user from 'calypso/lib/user';

export default {
	componentDidMount: function () {
		this.props.userSettings.getSettings();
	},

	componentWillUnmount: function () {
		// Silently clean up unsavedSettings before unmounting
		this.props.userSettings.unsavedSettings = {};
	},

	getDisabledState: function ( formName ) {
		return formName ? this.state.formsSubmitting[ formName ] : this.state.submittingForm;
	},

	UNSAFE_componentWillReceiveProps: function ( nextProp ) {
		if ( nextProp.showNoticeInitially ) {
			this.setState( { showNotice: nextProp.showNoticeInitially } );
		}
	},

	UNSAFE_componentWillUpdate: function () {
		this.showNotice();
	},

	getInitialState: function () {
		return {
			redirect: false,
			submittingForm: false,
			formsSubmitting: {},
			changingUsername: false,
			usernameAction: 'new',
			showNotice: false,
		};
	},

	showNotice: function () {
		if ( this.props.userSettings.initialized && this.state.showNotice ) {
			notices.clearNotices( 'notices' );

			notices.success( this.props.translate( 'Settings saved successfully!' ) );
			this.state.showNotice = false;
		}
	},

	getSetting: function ( settingName ) {
		return this.props.userSettings.getSetting( settingName ) || '';
	},

	toggleSetting: function ( event ) {
		const { name } = event.currentTarget;
		this.props.userSettings.updateSetting( name, ! this.getSetting( name ) );
	},

	updateSetting: function ( event ) {
		const { name, value } = event.currentTarget;
		this.props.userSettings.updateSetting( name, value );
	},

	handleSubmitError( error, formName = '' ) {
		debug( 'Error saving settings: ' + JSON.stringify( error ) );

		// handle error case here
		if ( error.message ) {
			notices.error( error.message );
		} else {
			notices.error( this.props.translate( 'There was a problem saving your changes.' ) );
		}

		this.setState( {
			submittingForm: false,
			formsSubmitting: {
				...this.state.formsSubmitting,
				...( formName && { [ formName ]: false } ),
			},
		} );
	},

	isSubmittingForm( formName ) {
		return formName ? this.state.formsSubmitting[ formName ] : this.state.submittingForm;
	},

	handleSubmitSuccess( response, formName = '' ) {
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
		this.setState( {
			showNotice: true,
			submittingForm: false,
			formsSubmitting: {
				...this.state.formsSubmitting,
				...( formName && { [ formName ]: false } ),
			},
		} );
		this.showNotice();
		debug( 'Settings saved successfully ' + JSON.stringify( response ) );
	},

	submitForm: function ( event, settingsToSave, formName = '' ) {
		event.preventDefault();
		debug( 'Submitting form' );

		this.setState( {
			submittingForm: true,
			formsSubmitting: {
				...this.state.formsSubmitting,
				...( formName && { [ formName ]: true } ),
			},
		} );

		this.props.userSettings.saveSettings(
			function ( error, response ) {
				if ( error ) {
					this.handleSubmitError( error, formName );
				} else {
					this.handleSubmitSuccess( response, formName );
				}
			}.bind( this ),
			settingsToSave
		);
	},
};
