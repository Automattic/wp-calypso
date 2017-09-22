/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

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
		this.props.onClose( 'accept' === action );

		if ( this.isMounted() ) {
			this.setState( { isVisible: false } );
		}
	},

	getActionButtons: function() {
		const { options } = this.props;
		const isScary = options && options.isScary;
		const additionalClassNames = classnames( { 'is-scary': isScary } );
		return [
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
