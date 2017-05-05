/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:me:form-base' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' );

module.exports = {
	componentDidMount: function() {
		this.props.userSettings.getSettings();
	},

	componentWillUnmount: function() {
		// Silently clean up unsavedSettings before unmounting
		this.props.userSettings.unsavedSettings = {};
	},

	getDisabledState: function() {
		return ( this.state.submittingForm );
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
			submittingForm: false,
			usernameAction: 'new',
			showNotice: false,
		};
	},

	showNotice: function() {
		if ( this.props.userSettings.initialized && this.state.showNotice ) {
			notices.clearNotices( 'notices' );
			notices.success( this.translate( 'Settings saved successfully!' ) );
			this.state.showNotice = false;
		}
	},

	valueLink: function( settingName ) {
		return {
			value: this.props.userSettings.getSetting( settingName ),
			requestChange: function( value ) {
				this.props.userSettings.updateSetting( settingName, value );
			}.bind( this )
		};
	},

	submitForm: function( event ) {
		event.preventDefault();
		debug( 'Submitting form' );

		this.setState( { submittingForm: true } );
		this.props.userSettings.saveSettings( function( error, response ) {
			this.setState( { submittingForm: false } );
			if ( error ) {
				debug( 'Error saving settings: ' + JSON.stringify( error ) );

				// handle error case here
				if ( error.message ) {
					notices.error( error.message );
				} else {
					notices.error( this.translate( 'There was a problem saving your changes.' ) );
				}
			} else {
				this.props.markSaved && this.props.markSaved();
				this.setState( { showNotice: true } );
				this.showNotice();
				debug( 'Settings saved successfully ' + JSON.stringify( response ) );
			}
		}.bind( this ) );
	}
};
