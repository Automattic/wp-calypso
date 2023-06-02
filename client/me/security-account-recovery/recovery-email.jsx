import { localize } from 'i18n-calypso';
import { Component } from 'react';
import accept from 'calypso/lib/accept';
import EditEmail from './edit-email';
import ManageContact from './manage-contact';

class RecoveryEmail extends Component {
	render() {
		const { primaryEmail, email, translate, isLoading } = this.props;

		return (
			<ManageContact
				type="email"
				isLoading={ isLoading }
				title={ translate( 'Recovery email address' ) }
				subtitle={ email ? email : translate( 'Not set' ) }
				hasValue={ !! email }
				onSave={ this.onSave }
				onDelete={ this.onDelete }
			>
				<EditEmail primaryEmail={ primaryEmail } storedEmail={ email || '' } />
			</ManageContact>
		);
	}

	onSave = ( newEmail ) => {
		this.props.updateEmail( newEmail );
	};

	onDelete = () => {
		const { translate, deleteEmail } = this.props;

		accept( translate( 'Are you sure you want to remove the email address?' ), ( accepted ) => {
			if ( accepted ) {
				deleteEmail();
			}
		} );
	};
}

export default localize( RecoveryEmail );
