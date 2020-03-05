/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

const ConfirmPurchaseModal: FunctionComponent = props => {
	const { __: NO__ } = useI18n();

	const handleCancel = () => {
		props.onCancel();
	};

	const handlePurchase = () => {
		props.onAccept();
	};

	const handleESC = event => {
		if ( event.keyCode === 27 ) {
			props.onCancel();
		}
	};

	return (
		<div className="confirm-purchase-modal">
			<div
				className="confirm-purchase-modal__background"
				onClick={ handleCancel }
				onKeyPress={ handleESC }
				role="dialog"
			/>
			<Card className="confirm-purchase-modal__content">
				<div className="confirm-purchase-modal__header">
					{ NO__( 'You are about to register your new domain!' ) }
				</div>
				<div className="confirm-purchase-modal__items">
					{ NO__(
						'To be able to complete the registration of %s, you need to take some extra steps: ',
						props.selectedDomain
					) }
					<ul>
						{ ! props.isLogged && <li>{ NO__( 'Create an account' ) }</li> }
						<li>{ NO__( 'Create your site' ) }</li>
						<li>{ NO__( 'Purchase a paid plan' ) }</li>
					</ul>
					{ NO__(
						'Every paid plan include a domain registration. Once you have completed the purchase of your new plan, we will continue with the set up of your site.'
					) }
				</div>
				<div className="confirm-purchase-modal__buttons">
					<Button
						isLarge
						type="button"
						className="confirm-purchase-modal__buttons-cancel"
						onClick={ handleCancel }
					>
						{ NO__( 'Do it later' ) }
					</Button>
					<Button
						isLarge
						isPrimary
						type="button"
						className="confirm-purchase-modal__buttons-accept"
						onClick={ handlePurchase }
					>
						{ NO__( 'Create your site and register your new domain' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default ConfirmPurchaseModal;
