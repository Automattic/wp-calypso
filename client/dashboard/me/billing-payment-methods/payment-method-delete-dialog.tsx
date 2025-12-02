import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';
import { PaymentMethodDetails } from './payment-method-details';
import type { Purchase, StoredPaymentMethod } from '@automattic/api-core';

interface Props {
	paymentMethod: StoredPaymentMethod;
	isVisible: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export const PaymentMethodDeleteDialog = ( {
	paymentMethod,
	onCancel,
	isVisible,
	onConfirm,
}: Props ) => {
	const locale = useLocale();
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const associatedSubscriptions =
		purchases?.filter(
			( purchase: Purchase ) =>
				purchase.stored_details_id === paymentMethod.stored_details_id &&
				purchase.is_auto_renew_enabled
		) ?? [];

	if ( ! isVisible ) {
		return null;
	}

	return (
		<ConfirmDialog
			isOpen={ isVisible }
			confirmButtonText={ __( 'Remove payment method' ) }
			size="large"
			onConfirm={ onConfirm }
			onCancel={ onCancel }
		>
			<VStack spacing={ 6 }>
				<Heading level={ 2 } size={ 20 } weight={ 500 }>
					{ __( 'Remove payment method' ) }
				</Heading>
				<Text>
					{ __(
						'The following payment method will be removed from your account and from all the associated subscriptions.'
					) }
				</Text>

				<HStack justify="flex-start">
					<VStack>
						<Text weight={ 500 }>{ paymentMethod.name }</Text>
						<PaymentMethodDetails paymentMethod={ paymentMethod } />
					</VStack>
				</HStack>

				{ associatedSubscriptions.length > 0 && (
					<VStack spacing={ 6 }>
						<Heading level={ 3 } size={ 18 } weight={ 500 }>
							{ __( 'Associated subscriptions' ) }
						</Heading>
						<VStack
							spacing={ 6 }
							style={
								// Make the list scrollable because it could be very large.
								// FIXME: this scrolling is not very elegant
								{ maxHeight: '150px', overflow: 'scroll', display: 'block' }
							}
						>
							{ associatedSubscriptions.map( ( purchase: Purchase ) => (
								<HStack key={ purchase.ID }>
									<VStack>
										<Text weight={ 500 }>{ purchase.product_name }</Text>
										<Text>{ purchase.meta || purchase.domain }</Text>
									</VStack>
									<Text>
										{ sprintf(
											// translators: date is a formatted renewal date
											__( 'Renews on %(date)s' ),
											{
												date: formatDate( new Date( purchase.renew_date ), locale, {
													dateStyle: 'long',
												} ),
											}
										) }
									</Text>
								</HStack>
							) ) }
						</VStack>
						<Notice variant="warning">
							<Text>
								{ _n(
									'This subscription will no longer auto-renew until an alternative payment method is added.',
									'These subscriptions will no longer auto-renew until an alternative payment method is added.',
									associatedSubscriptions.length
								) }
							</Text>
						</Notice>
					</VStack>
				) }
			</VStack>
		</ConfirmDialog>
	);
};
