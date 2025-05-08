import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { cloneElement, Component } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

class ManageContact extends Component {
	renderEdit() {
		return (
			<div className="security-account-recovery-contact__detail">
				{ cloneElement( this.props.children, {
					onSave: this.onSave,
					onDelete: this.props.onDelete && this.onDelete,
					onCancel: this.props.onCancel && this.onCancel,
				} ) }
			</div>
		);
	}

	renderLoading() {
		return (
			<div>
				<p className="security-account-recovery-contact__placeholder-heading"> &nbsp; </p>
				<p className="security-account-recovery-contact__placeholder-text"> &nbsp; </p>
			</div>
		);
	}

	render() {
		if ( this.props.isLoading ) {
			return this.renderLoading();
		}

		return <div className="security-account-recovery-contact">{ this.renderEdit() }</div>;
	}

	onSave = ( data ) => {
		this.props.onSave( data );
		this.recordEvent( 'save' );
	};

	onDelete = () => {
		this.props.onDelete();
		this.recordEvent( 'delete' );
	};

	onCancel = () => {
		this.props.onCancel();
		this.recordEvent( 'cancel' );
	};

	recordEvent( action ) {
		const event = `calypso_security_account_recovery_${ this.props.type }_${ action }_click`;
		recordTracksEvent( event );
	}
}

ManageContact.propTypes = {
	type: PropTypes.string,
	disabled: PropTypes.bool,
};

export default localize( ManageContact );
