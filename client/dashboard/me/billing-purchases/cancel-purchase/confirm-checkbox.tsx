import { localizeUrl } from '@automattic/i18n-utils';
import {
	CheckboxControl,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Text } from '../../../components/text';
import { getPurchaseCancellationFlowType, CANCEL_FLOW_TYPE } from '../../../utils/purchase';
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

	const supportHeadingText = ( () => {
		if ( getPurchaseCancellationFlowType( purchase ) === CANCEL_FLOW_TYPE.REMOVE ) {
			return __( 'Have a question before removing?' );
		}
		return __( 'Have a question before cancelling?' );
	} )();

	const planConfirmationLabel = ( () => {
		if ( getPurchaseCancellationFlowType( purchase ) === CANCEL_FLOW_TYPE.REMOVE ) {
			if ( purchase.is_plan ) {
				return __( 'I understand my site will change when I remove my plan.' );
			}
			return __( 'I understand my site will change when I remove this product.' );
		}
		return __( 'I understand my site will change when my plan expires.' );
	} )();

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
							return;
						}

						onCustomerConfirmedUnderstandingChange( checked );
					} }
				/>
			</VStack>
		</VStack>
	);
}
