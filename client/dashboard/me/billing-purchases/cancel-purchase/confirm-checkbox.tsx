import { localizeUrl } from '@automattic/i18n-utils';
import {
	CheckboxControl,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Text } from '../../../components/text';
import type { CancelPurchaseState } from './types';
import type { Purchase, AtomicTransfer } from '@automattic/api-core';

interface ConfirmCheckboxProps {
	purchase: Purchase;
	atomicTransfer?: AtomicTransfer;
	state: CancelPurchaseState;
	onDomainConfirmationChange: ( checked: boolean ) => void;
	onCustomerConfirmedUnderstandingChange: ( checked: boolean ) => void;
}

export default function ConfirmCheckbox( {
	purchase,
	atomicTransfer,
	state,
	onDomainConfirmationChange,
	onCustomerConfirmedUnderstandingChange,
}: ConfirmCheckboxProps ) {
	const isDomainRegistrationPurchase = purchase && purchase.is_domain_registration;

	return (
		<VStack spacing={ 4 }>
			<Text weight="bold">{ __( 'Have a question before cancelling?' ) }</Text>
			<Text>
				{ createInterpolateElement(
					__( 'Our support team is here for you. <contactLink>Contact us</contactLink>' ),
					{
						contactLink: <a href={ localizeUrl( 'https://wordpress.com/support' ) } />,
					}
				) }
			</Text>

			<Divider />

			<div>
				{ isDomainRegistrationPurchase && ! state.surveyShown && (
					<CheckboxControl
						label={ __( 'I understand that canceling means that I may lose this domain forever.' ) }
						checked={ state.domainConfirmationConfirmed }
						onChange={ onDomainConfirmationChange }
					/>
				) }

				<CheckboxControl
					label={ __( 'I understand my site will change when my plan expires.' ) }
					checked={ state.customerConfirmedUnderstanding }
					onChange={ ( checked ) => {
						if ( atomicTransfer?.created_at ) {
							onCustomerConfirmedUnderstandingChange( checked );
							return;
						}

						onCustomerConfirmedUnderstandingChange( checked );
					} }
				/>
			</div>
		</VStack>
	);
}
