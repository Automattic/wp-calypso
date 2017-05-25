/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { actionType } from './constants';

class DomainConnectAuthorizeFooter extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		onClose: PropTypes.func,
		onConfirm: PropTypes.func,
		showAction: PropTypes.oneOf( actionType )
	};

	static defaultProps = {
		isPlaceholder: false
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span></span>
				<span></span>
			</div>
		);
	}

	renderActionConfirmCancel = () => {
		const { translate } = this.props;
		const notReadyToSubmit = actionType.READY_TO_SUBMIT !== this.props.showAction;

		return (
			<div>
				<p>
					{
						translate( 'When you\'re ready to proceed, click Confirm. If this isn\'t what you meant to do, ' +
							'click Cancel and we won\'t make any changes.' )
					}
				</p>
				<Button
					busy={ notReadyToSubmit }
					className="domain-connect__button"
					disabled={ notReadyToSubmit }
					icon
					onClick={ this.props.onConfirm }
					primary>
					<Gridicon icon="checkmark" /> { translate( 'Confirm' ) }
				</Button>
				<Button
					busy={ notReadyToSubmit }
					className="domain-connect__button"
					disabled={ notReadyToSubmit }
					icon
					onClick={ this.props.onClose }>
					<Gridicon icon="cross" /> { translate( 'Cancel' ) }
				</Button>
			</div>
		);
	}

	renderActionClose = () => {
		const { translate } = this.props;

		return (
			<Button
				className="domain-connect__button"
				onClick={ this.props.onClose }>
				{ translate( 'Close' ) }
			</Button>
		);
	}

	renderAction = () => {
		switch ( this.props.showAction ) {
			case actionType.READY_TO_SUBMIT:
			case actionType.SUBMITTING:
				return this.renderActionConfirmCancel();
			case actionType.CLOSE:
				return this.renderActionClose();
		}
	}

	render() {
		const { isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		return this.renderAction();
	}
}

export default localize( DomainConnectAuthorizeFooter );
