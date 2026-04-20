import { localizeUrl } from '@automattic/i18n-utils';
import {
	CheckboxControl,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { intlFormat } from 'date-fns';
import { Text } from '../../../components/text';
import { DisplayVariant } from '../../../utils/purchase';
import { getCheckboxLabel } from './get-confirmation-copy';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface ConfirmCheckboxProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingAtomicPlanRevert: ( checked: boolean ) => void;
}

export default function ConfirmCheckbox( {
	purchase,
	displayVariant,
	atomicTransfer,
	state,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
	onCustomerConfirmedUnderstandingAtomicPlanRevert,
}: ConfirmCheckboxProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;

	const supportHeadingText =
		displayVariant === 'remove'
			? __( 'Have a question before removing?' )
			: __( 'Have a question before cancelling?' );

	const expiryDateFormatted = purchase.expiry_date
		? intlFormat( purchase.expiry_date, { dateStyle: 'medium' }, { locale: 'en-US' } )
		: '';

	const planConfirmationLabel = getCheckboxLabel( {
		purchase,
		intent: displayVariant === 'remove' ? 'remove' : 'cancel',
		expiryDateFormatted,
	} );

	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Text weight="bold">{ supportHeadingText }</Text>
				<Text>
					{ createInterpolateElement(
						__( 'Our support team is here for you. <contactLink>Contact us</contactLink>' ),
						{
							contactLink: <a href={ localizeUrl( 'https://wordpress.com/support' ) } />,
						}
					) }
				</Text>
			</VStack>

			<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />

			<VStack spacing={ 1 }>
				{ isDomainRegistrationPurchase && ! state.surveyShown && (
					<CheckboxControl
						label={ __( 'I understand that canceling means that I may lose this domain forever.' ) }
						checked={ state.domainConfirmationConfirmed }
						onChange={ onDomainConfirmationChange }
					/>
				) }

				<CheckboxControl
					label={ planConfirmationLabel }
					checked={ state.customerConfirmedUnderstanding }
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
