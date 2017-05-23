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

	placeholder = () => {
		return (
			<div className="domain-connect__footer is-placeholder">
				<span></span>
				<span></span>
			</div>
		);
	}

	renderActionConfirmCancel = () => {
		const { translate } = this.props;

		return (
			<div>
				<p>
					{
						translate( 'When you\'re ready to proceed, click Confirm. If this isn\'t what you meant to do, ' +
							'click Cancel and we won\'t make any changes.' )
					}
				</p>
				<div>
					<Button
						busy={ actionType.READY_TO_SUBMIT !== this.props.showAction }
						className="domain-connect__button"
						disabled={ actionType.READY_TO_SUBMIT !== this.props.showAction }
						icon
						onClick={ this.props.onConfirm }
						primary>
						<Gridicon icon="checkmark" /> { translate( 'Confirm' ) }
					</Button>
					<Button
						busy={ actionType.READY_TO_SUBMIT !== this.props.showAction }
						className="domain-connect__button"
						disabled={ actionType.READY_TO_SUBMIT !== this.props.showAction }
						icon
						onClick={ this.props.onClose }>
						<Gridicon icon="cross" /> { translate( 'Cancel' ) }
					</Button>
				</div>
			</div>
		);
	}

	renderActionClose = () => {
		const { translate } = this.props;

		return (
			<div>
				<Button
					className="domain-connect__button"
					onClick={ this.props.onClose }>
					{ translate( 'Close' ) }
				</Button>
			</div>
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

		return (
			<div>
				{ this.renderAction() }
			</div>
		);
	}
}

DomainConnectAuthorizeFooter.propTypes = {
	isPlaceholder: PropTypes.bool,
	onClose: PropTypes.func,
	onConfirm: PropTypes.func,
	showAction: PropTypes.oneOf( actionType )
};

DomainConnectAuthorizeFooter.defaultProps = {
	isPlaceholder: false
};

export default localize( DomainConnectAuthorizeFooter );
