import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { TaxLocationForm, defaultTaxLocation } from '../../components/tax-location-form';
import { Text } from '../../components/text';
import { PaymentMethodDetails } from './payment-method-details';
import type { StoredPaymentMethod, StoredPaymentMethodTaxLocation } from '@automattic/api-core';

export function PaymentMethodEditDialog( {
	paymentMethod,
	isVisible,
	onCancel,
	onConfirm,
}: {
	paymentMethod: StoredPaymentMethod;
	isVisible: boolean;
	onCancel: () => void;
	onConfirm: ( paymentMethod: StoredPaymentMethod ) => void;
} ) {
	const [ formData, setFormData ] = useState< StoredPaymentMethodTaxLocation >(
		paymentMethod.tax_location ?? defaultTaxLocation
	);

	return (
		<ConfirmDialog
			isVisible={ isVisible }
			confirmButtonText={ __( 'Save' ) }
			size="large"
			onConfirm={ () =>
				onConfirm( {
					...paymentMethod,
					tax_location: formData,
				} )
			}
			onCancel={ onCancel }
		>
			<VStack style={ { gap: '24px' } }>
				<Heading level={ 2 } size={ 20 } weight={ 500 }>
					{ __( 'Edit billing address' ) }
				</Heading>
				<Text>{ __( 'Set the billing address for the following payment method.' ) }</Text>
				<HStack justify="flex-start">
					<VStack>
						<Text weight={ 500 }>{ paymentMethod.name }</Text>
						<PaymentMethodDetails paymentMethod={ paymentMethod } />
					</VStack>
				</HStack>

				<TaxLocationForm
					data={ formData }
					onChange={ ( updated ) => {
						setFormData( ( previous ) => ( { ...previous, ...updated } ) );
					} }
				/>
			</VStack>
		</ConfirmDialog>
	);
}
