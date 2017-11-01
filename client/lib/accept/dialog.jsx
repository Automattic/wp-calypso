/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

class AcceptDialog extends React.Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		message: PropTypes.node,
		onClose: PropTypes.func.isRequired,
		confirmButtonText: PropTypes.node,
		cancelButtonText: PropTypes.node,
		options: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.state = {
			isVisible: true,
		};

		this.hide = noop;
	}

	componentDidMount() {
		this.hide = () => {
			this.setState( () => {
				isVisible: false;
			} );
		};
	}

	componentWillUnmount() {
		this.hide = noop;
	}

	onClose = action => {
		this.props.onClose( 'accept' === action );
		this.hide();
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
				className="accept-dialog"
				isVisible
			>
				{ this.props.message }
			</Dialog>
		);
	}
}

export default localize( AcceptDialog );
