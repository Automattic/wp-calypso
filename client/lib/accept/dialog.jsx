/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

const AcceptDialog = React.createClass( {
	propTypes: {
		translate: PropTypes.func,
		message: PropTypes.node,
		onClose: PropTypes.func.isRequired,
		confirmButtonText: PropTypes.node,
		cancelButtonText: PropTypes.node,
		options: PropTypes.object
	},

	getInitialState: function() {
		return { isVisible: true };
	},

	onClose: function( action ) {
		this.props.onClose( 'accept' === action, action );

		if ( this.isMounted() ) {
			this.setState( { isVisible: false } );
		}
	},

	getActionButtons: function() {
		const { options } = this.props;
		const isScary = options && options.isScary;
		const additionalClassNames = classnames( { 'is-scary': isScary } );
		const buttons = [
			{
				action: 'cancel',
				label: this.props.cancelButtonText ? this.props.cancelButtonText : this.props.translate( 'Cancel' ),
			},
			{
				action: 'accept',
				label: this.props.confirmButtonText ? this.props.confirmButtonText : this.props.translate( 'OK' ),
				isPrimary: true,
				additionalClassNames
			}
		];

		const altButton = options && options.altButton;
		if ( altButton && altButton.label ) {
			buttons.unshift( {
				action: altButton.action || 'alt',
				label: altButton.label,
				additionalClassNames: classnames( {
					'is-scary': altButton.isScary,
					'is-borderless': true,
					'is-left-aligned': true
				} )
			} );
		}

		return buttons;
	},

	render: function() {
		if ( ! this.state.isVisible ) {
			return null;
		}

		return (
			<Dialog
				buttons={ this.getActionButtons() }
				onClose={ this.onClose }
				className="accept-dialog"
				isVisible>
				{ this.props.message }
			</Dialog>
		);
	}
} );

export default localize( AcceptDialog );
