/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './dialog.scss';

class AcceptDialog extends Component {
	static displayName = 'AcceptDialog';

	static propTypes = {
		translate: PropTypes.func,
		message: PropTypes.node,
		onClose: PropTypes.func.isRequired,
		confirmButtonText: PropTypes.node,
		cancelButtonText: PropTypes.node,
		options: PropTypes.object,
	};

	state = { isVisible: true };

	onClose = ( action ) => {
		this.setState( { isVisible: false } );
		this.props.onClose( 'accept' === action );
	};

	getActionButtons = () => {
		const { options } = this.props;
		const isScary = options && options.isScary;
		const additionalClassNames = classnames( { 'is-scary': isScary } );
		return [
			{
				action: 'cancel',
				label: this.props.cancelButtonText
					? this.props.cancelButtonText
					: this.props.translate( 'Cancel' ),
				additionalClassNames: 'is-cancel',
			},
			{
				action: 'accept',
				label: this.props.confirmButtonText
					? this.props.confirmButtonText
					: this.props.translate( 'OK' ),
				isPrimary: true,
				additionalClassNames,
			},
		];
	};

	render() {
		if ( ! this.state.isVisible ) {
			return null;
		}

		return (
			<Dialog
				buttons={ this.getActionButtons() }
				onClose={ this.onClose }
				className="accept__dialog"
				isVisible
			>
				{ this.props.message }
			</Dialog>
		);
	}
}

export default localize( AcceptDialog );
