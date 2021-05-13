/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { actionType } from './constants';

class DomainConnectAuthorizeFooter extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		onClose: PropTypes.func,
		onConfirm: PropTypes.func,
		showAction: PropTypes.oneOf( Object.keys( actionType ) ),
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span />
				<span />
			</div>
		);
	};

	renderActionConfirmCancel = () => {
		const { translate, showAction, onConfirm, onClose } = this.props;
		const notReadyToSubmit =
			actionType.READY_TO_SUBMIT !== showAction || actionType.REDIRECTING === showAction;

		const confirm = translate( 'Confirm' );
		const cancel = translate( 'Cancel' );

		return (
			<div>
				<p>
					{ translate(
						"When you're ready to proceed, click %(confirm)s. If this isn't what you meant to do, " +
							"click %(cancel)s and we won't make any changes.",
						{
							args: {
								confirm: confirm,
								cancel: cancel,
							},
						}
					) }
				</p>
				<Button
					busy={ notReadyToSubmit }
					className="domain-connect__button"
					disabled={ notReadyToSubmit }
					onClick={ onConfirm }
					primary
				>
					<Gridicon icon="checkmark" /> { confirm }
				</Button>
				<Button
					busy={ notReadyToSubmit }
					className="domain-connect__button"
					disabled={ notReadyToSubmit }
					onClick={ onClose }
				>
					<Gridicon icon="cross" /> { cancel }
				</Button>
			</div>
		);
	};

	renderActionClose = () => {
		const { translate } = this.props;

		return (
			<Button className="domain-connect__button" onClick={ this.props.onClose }>
				{ translate( 'Close' ) }
			</Button>
		);
	};

	renderAction = () => {
		switch ( this.props.showAction ) {
			case actionType.READY_TO_SUBMIT:
			case actionType.SUBMITTING:
			case actionType.REDIRECTING:
				return this.renderActionConfirmCancel();
			case actionType.CLOSE:
				return this.renderActionClose();
		}
	};

	render() {
		const { isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		return this.renderAction();
	}
}

export default localize( DomainConnectAuthorizeFooter );
