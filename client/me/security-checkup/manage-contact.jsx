/**
 * External dependencies
 */
import React, { Component } from 'react';
import keyMirror from 'key-mirror';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import Notice from 'components/notice';
import analytics from 'lib/analytics';

const views = keyMirror( {
	VIEWING: null,
	EDITING: null
} );

class ManageContact extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			currentView: views.VIEWING
		};
	}

	renderHeader() {
		const isEditing = views.EDITING === this.state.currentView;
		const { translate } = this.props;

		return (
			<div className="security-checkup-contact__header">
				<div className="security-checkup-contact__header-info">
					<span className="security-checkup-contact__header-title">{ this.props.title }</span>
					{
						isEditing
						? null
						: <span className="security-checkup-contact__header-subtitle">{ this.props.subtitle }</span>
					}
				</div>

				{
					isEditing
					? null
					: (
						<div className="security-checkup-contact__header-action">
							<FormButton
								disabled={ this.props.disabled }
								isPrimary={ false }
								onClick={ this.onEdit }>
								{ this.props.hasValue ? translate( 'Edit' ) : translate( 'Add' ) }
							</FormButton>
						</div>
					)
				}
			</div>
		);
	}

	renderEdit() {
		let view = null;

		if ( views.EDITING === this.state.currentView ) {
			view = (
				<div className="security-checkup-contact__detail">
					{
						React.cloneElement( this.props.children, {
							onCancel: this.onCancel,
							onSave: this.onSave,
							onDelete: this.onDelete
						} )
					}
				</div>
			);
		}

		return view;
	}

	renderNotice() {
		const { lastNotice } = this.props;

		if ( lastNotice && lastNotice.message ) {
			const isError = lastNotice.type === 'error';
			const showDismiss = lastNotice.showDismiss !== false;
			const onClick = showDismiss ? this.dismissNotice : null;

			return (
				<Notice
					status={ isError ? 'is-error' : 'is-success' }
					onDismissClick={ onClick }
					showDismiss={ showDismiss }
					>
					{ lastNotice.message }
				</Notice>
			);
		}

		return null;
	}

	renderLoading() {
		return (
			<div>
				<p className="security-checkup-contact__placeholder-heading"> &nbsp; </p>
				<p className="security-checkup-contact__placeholder-text"> &nbsp; </p>
			</div>
		);
	}

	render() {
		if ( this.props.isLoading ) {
			return this.renderLoading();
		}

		return (
			<div className="security-checkup-contact">
				{ this.renderHeader() }
				{ this.renderEdit() }
				{ this.renderNotice() }
			</div>
		);
	}

	onEdit = () => {
		this.dismissNotice();
		this.setState( { currentView: views.EDITING }, function() {
			this.recordEvent( this.props.hasValue ? 'edit' : 'add' );
		} );
	}

	onCancel = () => {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.recordEvent( 'cancel' );
		} );
	}

	onSave = ( data ) => {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.props.onSave( data );
			this.recordEvent( 'save' );
		} );
	}

	onDelete = () => {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.props.onDelete();
			this.recordEvent( 'delete' );
		} );
	}

	dismissNotice = () => {
		this.props.onDismissNotice();
	}

	recordEvent( action ) {
		const event = `calypso_security_checkup_${ this.props.type }_${ action }_click`;
		analytics.tracks.recordEvent( event );
	}
}

ManageContact.propTypes = {
	type: React.PropTypes.string,
	disabled: React.PropTypes.bool
};

export default localize( ManageContact );
