/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/object/assign' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependencies
 */
var AccountRecoveryStore = require( 'lib/security-checkup/account-recovery-store' ),
	SecurityCheckupActions = require( 'lib/security-checkup/actions' ),
	ManageContact = require( './manage-contact' ),
	EditPhone = require( './edit-phone' ),
	accept = require( 'lib/accept' );

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryPhone',

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
		return AccountRecoveryStore.getPhone();
	},

	render: function() {
		var phone = ! isEmpty( this.state.data ) ? this.state.data : false,
			twoStepEnabled = this.props.userSettings.isTwoStepEnabled(),
			twoStepNotice = null;

		if ( twoStepEnabled ) {
			twoStepNotice = {
				type: 'error',
				message: this.translate( 'To edit your SMS Number, go to {{a}}Two-Step Authentication{{/a}}.', {
					components: {
						a: <a href="/me/security/two-step" />
					}
				} ),
				showDismiss: false
			};
		}

		return (
			<ManageContact
				type="sms"
				isLoading={ this.state.loading }
				title={ this.translate( 'Recovery SMS Number', {
					comment: 'Account security'
				} ) }
				subtitle={ phone ? phone.numberFull : this.translate( 'Not set' ) }
				hasValue={ !! phone }
				lastNotice={ twoStepNotice || this.state.lastNotice }
				disabled={ twoStepEnabled }

				onSave={ this.onSave }
				onDelete={ this.onDelete }
				onDismissNotice={ this.onDismissNotice }
				>
					<EditPhone
						storedPhone={ this.state.data }
						/>
				</ManageContact>
		);
	},

	onSave: function( phone ) {
		SecurityCheckupActions.updatePhone( phone, this.state.data );
	},

	onDelete: function() {
		accept( this.translate( 'Are you sure you want to remove the SMS number?' ), function( accepted ) {
			if ( accepted ) {
				SecurityCheckupActions.deletePhone();
			}
		} );
	},

	onDismissNotice: function() {
		SecurityCheckupActions.dismissPhoneNotice();
	}
} );
