/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import { recordTracksEvent } from 'lib/analytics/tracks';

const views = {
	VIEWING: 'VIEWING',
	EDITING: 'EDITING',
};

class ManageContact extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			currentView: views.VIEWING,
		};
	}

	renderHeader() {
		const isEditing = views.EDITING === this.state.currentView;
		const { translate } = this.props;

		return (
			<div className="security-account-recovery-contact__header">
				<div className="security-account-recovery-contact__header-info">
					<span className="security-account-recovery-contact__header-title">
						{ this.props.title }
					</span>
					{ isEditing ? null : (
						<span className="security-account-recovery-contact__header-subtitle">
							{ this.props.subtitle }
						</span>
					) }
				</div>

				{ isEditing ? null : (
					<div className="security-account-recovery-contact__header-action">
						<FormButton
							disabled={ this.props.disabled }
							isPrimary={ false }
							onClick={ this.onEdit }
						>
							{ this.props.hasValue ? translate( 'Edit' ) : translate( 'Add' ) }
						</FormButton>
					</div>
				) }
			</div>
		);
	}

	renderEdit() {
		let view = null;

		if ( views.EDITING === this.state.currentView ) {
			view = (
				<div className="security-account-recovery-contact__detail">
					{ React.cloneElement( this.props.children, {
						onCancel: this.onCancel,
						onSave: this.onSave,
						onDelete: this.onDelete,
					} ) }
				</div>
			);
		}

		return view;
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

		return (
			<div className="security-account-recovery-contact">
				{ this.renderHeader() }
				{ this.renderEdit() }
			</div>
		);
	}

	onEdit = () => {
		this.setState( { currentView: views.EDITING }, function () {
			this.recordEvent( this.props.hasValue ? 'edit' : 'add' );
		} );
	};

	onCancel = () => {
		this.setState( { currentView: views.VIEWING }, function () {
			this.recordEvent( 'cancel' );
		} );
	};

	onSave = ( data ) => {
		this.setState( { currentView: views.VIEWING }, function () {
			this.props.onSave( data );
			this.recordEvent( 'save' );
		} );
	};

	onDelete = () => {
		this.setState( { currentView: views.VIEWING }, function () {
			this.props.onDelete();
			this.recordEvent( 'delete' );
		} );
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
