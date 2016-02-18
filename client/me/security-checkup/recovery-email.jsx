/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var AccountRecoveryStore = require( 'lib/security-checkup/account-recovery-store' ),
	SecurityCheckupActions = require( 'lib/security-checkup/actions' ),
	ManageContact = require( './manage-contact' ),
	EditEmail = require( './edit-email' ),
	accept = require( 'lib/accept' );

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryEmail',

	componentDidMount: function() {
		AccountRecoveryStore.on( 'change', this.refreshData );
	},

	componentWillUnmount: function() {
		AccountRecoveryStore.off( 'change', this.refreshData );
	},

	getInitialState: function() {
		return assign( {}, this.getDataFromStores() );
	},

	refreshData: function() {
		this.setState( this.getDataFromStores() );
	},

	getDataFromStores: function() {
		return AccountRecoveryStore.getEmail();
	},

	render: function() {
		var email = this.state.data ? this.state.data.email : false,
			primaryEmail = this.props.userSettings.getSetting( 'user_email' );

		return (
			<ManageContact
				type="email"
				isLoading={ this.state.loading }
				title={ this.translate( 'Recovery Email Address' ) }
				subtitle={ email ? email : this.translate( 'Not set' ) }
				hasValue={ !! email }
				lastNotice={ this.state.lastNotice }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ this.onDismissNotice }
				>
					<EditEmail
						primaryEmail={ primaryEmail }
						storedEmail={ this.state.data.email }
						/>
				</ManageContact>
		);
	},

	haveEmail: function() {
		return !! this.state.data.email;
	},

	onSave: function( email ) {
		SecurityCheckupActions.updateEmail( email, this.state.data.email );
	},

	onDelete: function() {
		accept( this.translate( 'Are you sure you want to remove the email address?' ), function( accepted ) {
			if ( accepted ) {
				SecurityCheckupActions.deleteEmail();
			}
		} );
	},

	onDismissNotice: function() {
		SecurityCheckupActions.dismissEmailNotice();
	}
} );
