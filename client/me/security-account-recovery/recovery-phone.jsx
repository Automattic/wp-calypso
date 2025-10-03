import { Button, Card, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import accept from 'calypso/lib/accept';
import EditPhone from './edit-phone';
import ManageContact from './manage-contact';

class RecoveryPhone extends Component {
	state = {
		isEditing: false,
	};

	render() {
		const { phone, translate, disabled, isLoading, isUpdateMode } = this.props;
		const { isEditing } = this.state;

		if ( isUpdateMode && ! isEditing ) {
			return (
				<Card className="recovery-phone-edit">
					<div className="recovery-phone-edit__information">
						<FormLabel>{ translate( 'Phone number' ) }</FormLabel>
						<h2>{ phone.numberFull }</h2>
					</div>
					<div className="recovery-phone-edit__actions">
						<Button onClick={ this.onEdit }>{ translate( 'Edit' ) }</Button>
						<Button scary onClick={ this.onDelete }>
							{ translate( 'Remove' ) }
						</Button>
					</div>
				</Card>
			);
		}

		return (
			<ManageContact
				type="sms"
				isLoading={ isLoading }
				title={ translate( 'Recovery SMS number', {
					comment: 'Account security',
				} ) }
				subtitle={ phone ? <span dir="ltr">{ phone.numberFull }</span> : translate( 'Not set' ) }
				hasValue={ !! phone }
				disabled={ disabled }
				onSave={ this.onSave }
				{ ...( isEditing ? { onCancel: this.onCancel } : { onDelete: this.onDelete } ) }
			>
				<EditPhone storedPhone={ phone } />
			</ManageContact>
		);
	}

	onSave = ( phone ) => {
		this.props.updatePhone( phone );
	};

	onEdit = () => {
		this.setState( { isEditing: true } );
	};

	onDelete = () => {
		const { translate, deletePhone } = this.props;

		accept( translate( 'Are you sure you want to remove the SMS number?' ), ( accepted ) => {
			if ( accepted ) {
				deletePhone();
			}
		} );
	};

	onCancel = () => {
		this.setState( { isEditing: false } );
	};
}

export default localize( RecoveryPhone );
