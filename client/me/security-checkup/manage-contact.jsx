/**
 * External dependencies
 */
var React = require( 'react' ),
	keyMirror = require( 'key-mirror' ),
	assign = require( 'lodash/assign' );

/**
 * Internal dependencies
 */
var FormButton = require( 'components/forms/form-button' ),
	Notice = require( 'components/notice' ),
	analytics = require( 'analytics' );

var views = keyMirror( {
	VIEWING: null,
	EDITING: null
} );

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryContact',

	propTypes: {
		type: React.PropTypes.string,
		disabled: React.PropTypes.bool
	},

	getInitialState: function() {
		return assign( {
			currentView: views.VIEWING
		} );
	},

	renderHeader: function() {
		var isEditing = views.EDITING === this.state.currentView;

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
								{ this.props.hasValue ? this.translate( 'Edit' ) : this.translate( 'Add' ) }
							</FormButton>
						</div>
					)
				}
			</div>
		);
	},

	renderEdit: function() {
		var view = null;

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
	},

	renderNotice: function() {
		var notice = null,
			lastNotice = this.props.lastNotice,
			showDismiss,
			onClick,
			isError;

		if ( lastNotice && lastNotice.message ) {
			isError = lastNotice.type === 'error';
			showDismiss = lastNotice.showDismiss !== false;
			onClick = showDismiss ? this.dismissNotice : null;

			notice = (
				<Notice
					status={ isError ? 'is-error' : 'is-success' }
					onDismissClick={ onClick }
					showDismiss={ showDismiss }
					>
					{ lastNotice.message }
				</Notice>
			);
		}
		return notice;
	},

	renderLoading: function() {
		return (
			<div>
				<p className="security-checkup-contact__placeholder-heading"> &nbsp; </p>
				<p className="security-checkup-contact__placeholder-text"> &nbsp; </p>
			</div>
		);
	},

	render: function() {
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
	},

	onEdit: function() {
		this.dismissNotice();
		this.setState( { currentView: views.EDITING }, function() {
			this.recordEvent( this.props.hasValue ? 'edit' : 'add' );
		} );
	},

	onCancel: function() {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.recordEvent( 'cancel' );
		} );
	},

	onSave: function( data ) {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.props.onSave( data );
			this.recordEvent( 'save' );
		} );
	},

	onDelete: function() {
		this.dismissNotice();
		this.setState( { currentView: views.VIEWING }, function() {
			this.props.onDelete();
			this.recordEvent( 'delete' );
		} );
	},

	dismissNotice: function() {
		this.props.onDismissNotice();
	},

	recordEvent: function( action ) {
		let event = `calypso_security_checkup_${ this.props.type }_${ action }_click`;
		analytics.tracks.recordEvent( event );
	}
} );
