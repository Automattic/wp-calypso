/**
 * External dependencies
 */

import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import SecurityCheckupActions from 'lib/security-checkup/actions';
import ManageContact from './manage-contact';
import EditPhone from './edit-phone';
import accept from 'lib/accept';

class RecoveryPhone extends Component {
	constructor( props ) {
		super( props );

		this.state = this.getDataFromStores();
	}

	componentDidMount() {
		AccountRecoveryStore.on( 'change', this.refreshData );
	}

	componentWillUnmount() {
		AccountRecoveryStore.off( 'change', this.refreshData );
	}

	refreshData = () => {
		this.setState( this.getDataFromStores() );
	}

	getDataFromStores() {
		return AccountRecoveryStore.getPhone();
	}

	getTwoStepNotice( twoStepEnabled ) {
		if ( twoStepEnabled ) {
			return {
				type: 'error',
				message: this.props.translate( 'To edit your SMS Number, go to {{a}}Two-Step Authentication{{/a}}.', {
					components: {
						a: <a href="/me/security/two-step" />
					}
				} ),
				showDismiss: false
			};
		}

		return null;
	}

	render() {
		const phone = ! isEmpty( this.state.data ) ? this.state.data : false;
		const twoStepEnabled = this.props.userSettings.isTwoStepEnabled();
		const twoStepNotice = this.getTwoStepNotice( twoStepEnabled );
		const { translate } = this.props;

		return (
			<ManageContact
				type="sms"
				isLoading={ this.state.loading }
				title={ translate( 'Recovery SMS Number', {
					comment: 'Account security'
				} ) }
				subtitle={ phone ? phone.numberFull : translate( 'Not set' ) }
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
	}

	onSave = ( phone ) => {
		SecurityCheckupActions.updatePhone( phone, this.state.data );
	}

	onDelete = () => {
		accept( this.props.translate( 'Are you sure you want to remove the SMS number?' ), function( accepted ) {
			if ( accepted ) {
				SecurityCheckupActions.deletePhone();
			}
		} );
	}

	onDismissNotice = () => {
		SecurityCheckupActions.dismissPhoneNotice();
	}
}

export default localize( RecoveryPhone );
