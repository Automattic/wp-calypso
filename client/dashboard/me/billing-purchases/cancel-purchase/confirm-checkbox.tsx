import config from '@automattic/calypso-config';
import {
	Button,
	CheckboxControl,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useHelpCenter } from '../../../app/help-center';
import { Text } from '../../../components/text';
import { DisplayVariant } from '../../../utils/purchase';
import { getCheckboxLabel } from './get-confirmation-copy';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface ConfirmCheckboxProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	atomicTransfer?: AtomicTransfer;
	disabled?: boolean;
	state: CancelPurchaseState;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
}

export default function ConfirmCheckbox( {
	purchase,
	displayVariant,
	atomicTransfer,
	disabled,
	state,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
}: ConfirmCheckboxProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;
	const isSplitEnabled = config.isEnabled( 'purchases/split-cancel-remove' );
	const { setNewMessagingChat } = useHelpCenter();
	const handleContactClick = () => {
		setNewMessagingChat( {
			initialMessage:
				displayVariant === 'remove'
					? `I have questions about removing my ${ purchase.product_name }. Can I speak with a human?`
					: `I have questions about cancelling my ${ purchase.product_name }. Can I speak with a human?`,
			siteUrl: purchase.site_slug,
			siteId: String( purchase.blog_id ),
		} );
	};

	const supportHeadingText =
		displayVariant === 'remove'
			? __( 'Questions before you remove?' )
			: __( 'Have a question before canceling?' );

	const planConfirmationLabel = getCheckboxLabel();

	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Text weight="bold">{ supportHeadingText }</Text>
				<Text>
					{ createInterpolateElement(
						__( 'Our support team is here for you. <contactLink>Contact us</contactLink>' ),
						{
							contactLink: <Button variant="link" onClick={ handleContactClick } />,
						}
					) }
				</Text>
			</VStack>

			<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />

			<VStack spacing={ 1 }>
				{ isDomainRegistrationPurchase && ! state.surveyShown && ! isSplitEnabled && (
					<CheckboxControl
						label={ __( 'I understand that canceling means that I may lose this domain forever.' ) }
						checked={ state.domainConfirmationConfirmed }
						disabled={ disabled }
						onChange={ onDomainConfirmationChange }
					/>
				) }

				<CheckboxControl
					label={ planConfirmationLabel }
					checked={ state.customerConfirmedUnderstanding }
					disabled={ disabled }
					onChange={ ( checked ) => {
						if ( atomicTransfer?.created_at ) {
							onCustomerConfirmedUnderstandingChange( checked );
							onCustomerConfirmedUnderstandingAtomicPlanRevert( checked );
							return;
						}

						onCustomerConfirmedUnderstandingChange( checked );
					} }
				/>
			</VStack>
		</VStack>
	);
}
