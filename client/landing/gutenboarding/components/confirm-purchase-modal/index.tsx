/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Button, Modal } from '@wordpress/components';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { USER_STORE } from '../../stores/user';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props {
	onCancel: () => void;
	onAccept: () => void;
	selectedDomain: DomainSuggestion;
}
const ConfirmPurchaseModal: FunctionComponent< Props > = props => {
	const { __: NO__ } = useI18n();
	const isLoggedIn = useSelect( select => select( USER_STORE ).isCurrentUserLoggedIn() );

	return (
		<Modal
			title={ NO__( 'You are about to register your new domain!' ) }
			className="confirm-purchase-modal"
			isDismissible={ false }
			onRequestClose={ props.onCancel }
		>
			<Card className="confirm-purchase-modal__content">
				<div className="confirm-purchase-modal__header">
					{ NO__( 'You are about to register your new domain!' ) }
				</div>
				<div className="confirm-purchase-modal__items">
					{ __experimentalCreateInterpolateElement(
						sprintf(
							NO__(
								'To be able to complete the registration of <DomainName>%s</DomainName>, you need to take some extra steps: '
							),
							props.selectedDomain.domain_name
						),
						{ DomainName: <em /> }
					) }
					<ul>
						{ isLoggedIn && <li>{ NO__( 'Create an account' ) }</li> }
						<li>{ NO__( 'Create your site' ) }</li>
						<li>{ NO__( 'Purchase a paid plan' ) }</li>
					</ul>
					{ NO__(
						'Every paid plan includes a domain registration. Once you have completed the purchase of your new plan, we will continue with the set up of your site.'
					) }
				</div>
				<div className="confirm-purchase-modal__buttons">
					<Button
						isLarge
						type="button"
						className="confirm-purchase-modal__buttons-cancel"
						onClick={ props.onCancel }
					>
						{ NO__( 'Do it later' ) }
					</Button>
					<Button
						isLarge
						isPrimary
						type="button"
						className="confirm-purchase-modal__buttons-accept"
						onClick={ props.onAccept }
					>
						{ NO__( 'Create your site and register your new domain' ) }
					</Button>
				</div>
			</Card>
		</Modal>
	);
};

export default ConfirmPurchaseModal;
