import { PaymentPartners } from '@automattic/api-core';
import {
	receiptQuery,
	sendReceiptEmailMutation,
	userTaxDetailsQuery,
} from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	Flex,
	TextControl,
	__experimentalDivider as Divider,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { receiptRoute, taxDetailsRoute } from '../../app/router/me';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	formatReceiptAmount,
	formatReceiptTaxAmount,
	groupDomainProducts,
	getTransactionTermLabel,
	renderTransactionQuantitySummary,
	DomainTransactionVolumeSummary,
	transactionIncludesTax,
	isTransactionJetpackSearch10kTier,
	renderJetpackSearch10kTierBreakdown,
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
} from './utils';
import type { Receipt, ReceiptItem, ReceiptItemCostOverride } from '@automattic/api-core';
import './styles.scss';

export interface IntroductoryOfferTerms {
	enabled: boolean;
	interval_unit: string;
	interval_count: number;
	transition_after_renewal_count: number;
}

export interface LineItemCostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;
	/**
	 * The amount saved by this cost override in the currency's smallest unit.
	 * If not set, a number will not be displayed.
	 */
	discountAmount?: number;
}

export default function Receipt() {
	const params = receiptRoute.useParams();
	const receiptId = params.receiptId;
	const { data: receipt } = useSuspenseQuery( receiptQuery( receiptId ) );

	const handlePrint = () => {
		window.print();
	};

	const formattedDate = new Date( receipt.date ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );

	return (
		<PageLayout
			size="small"
			header={ <PageHeader title={ __( 'Receipt' ) } prefix={ <Breadcrumbs length={ 3 } /> } /> }
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<HStack justify="space-between">
							<HStack spacing={ 4 } justify="flex-start">
								<img src={ receipt.icon } alt={ receipt.service } className="receipt-icon" />
								<VStack spacing={ 0.5 } alignment="flex-start">
									<Text size={ 15 } weight={ 500 }>
										{ receipt.service }
									</Text>
									<Text variant="muted" size={ 11 }>
										{ receipt.service_slug === 'memberships'
											? sprintf(
													/* translators: %s: organization name */
													__( 'Payment processed by %s' ),
													receipt.org
											  )
											: sprintf(
													/* translators: %s: organization name */
													__( 'by %s' ),
													receipt.org
											  ) }
									</Text>
									{ receipt.address && (
										<Text variant="muted" size={ 11 }>
											{ receipt.address }
										</Text>
									) }
								</VStack>
							</HStack>
							<Text variant="muted" size={ 11 } className="receipt-date">
								{ formattedDate }
							</Text>
						</HStack>
						<VStack spacing={ 6 }>
							<ReceiptDetails receipt={ receipt } />
							<ReceiptLineItems receipt={ receipt } />
							<Flex gap={ 2 }>
								<Button variant="primary" onClick={ handlePrint }>
									{ __( 'Print Receipt' ) }
								</Button>
							</Flex>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

function ReceiptDetails( { receipt }: { receipt: Receipt } ) {
	const [ billingDetailsText, setBillingDetailsText ] = useState(
		receipt.cc_num !== 'XXXX' ? `${ receipt.cc_name }\n${ receipt.cc_email }` : ''
	);

	const paymentMethodText = getPaymentMethodText( receipt );

	return (
		<VStack spacing={ 3 } alignment="flex-start">
			<VStack spacing={ 1 } alignment="flex-start">
				<Text upperCase variant="muted" size={ 11 }>
					{ __( 'Receipt ID' ) }
				</Text>
				<span className="receipt-monospace">{ receipt.id }</span>
			</VStack>

			{ receipt.pay_ref && (
				<VStack spacing={ 1 } alignment="flex-start">
					<Text upperCase variant="muted" size={ 11 }>
						{ __( 'Transaction ID' ) }
					</Text>
					<span className="receipt-monospace">{ receipt.pay_ref }</span>
				</VStack>
			) }

			{ paymentMethodText && (
				<VStack spacing={ 1 } alignment="flex-start">
					<Text upperCase variant="muted" size={ 11 }>
						{ __( 'Payment Method' ) }
					</Text>
					<span>{ paymentMethodText }</span>
				</VStack>
			) }

			{ receipt.cc_num !== 'XXXX' && ( receipt.cc_name || receipt.cc_email ) && (
				<VStack spacing={ 1 } alignment="flex-start" className="receipt-billing-details">
					<Text upperCase variant="muted" size={ 11 }>
						{ __( 'Billing details' ) }
					</Text>
					<TextControl
						value={ billingDetailsText }
						onChange={ setBillingDetailsText }
						className="receipt-text-control"
						__nextHasNoMarginBottom
					/>
					<Text variant="muted" size={ 11 }>
						{ __(
							'Use this field to add your billing information (eg. business address) before printing.'
						) }
					</Text>
				</VStack>
			) }

			<VatDetails receipt={ receipt } />
		</VStack>
	);
}

function UserVatDetails( { receipt }: { receipt: Receipt } ) {
	const { data: vatDetails, isLoading, error } = useQuery( userTaxDetailsQuery() );
	const sendEmailMutation = useMutation( {
		...sendReceiptEmailMutation(),
		meta: {
			snackbar: {
				success: __( 'Your receipt was sent by email successfully.' ),
				error: __(
					'There was a problem sending your receipt. Please try again later or contact support.'
				),
			},
		},
	} );

	const handleEmailReceipt = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		sendEmailMutation.mutate( String( receipt.id ) );
	};

	if ( isLoading || error || ! vatDetails?.id ) {
		return null;
	}

	return (
		<VStack spacing={ 1 } alignment="flex-start">
			<Text upperCase variant="muted" size={ 11 }>
				{ __( 'VAT Details' ) }
			</Text>
			<VStack spacing={ 0.5 } alignment="flex-start">
				<div>{ vatDetails.name }</div>
				<div>{ vatDetails.address }</div>
				<div>
					{ sprintf(
						/* translators: 1: VAT country code, 2: VAT ID number */
						__( 'VAT #: %1$s %2$s' ),
						vatDetails.country ?? '',
						vatDetails.id
					) }
				</div>
				<Text variant="muted" size={ 11 } className="receipt-vat-details-description">
					{ createInterpolateElement(
						__(
							'You can edit your VAT details <vatDetailsLink>on this page</vatDetailsLink>. This is not an official VAT receipt. For an official VAT receipt, <emailReceiptButton>email yourself a copy</emailReceiptButton>.'
						),
						{
							vatDetailsLink: <Link to={ taxDetailsRoute.fullPath } />,
							emailReceiptButton: (
								<Button
									className="receipt-email-button"
									variant="link"
									onClick={ handleEmailReceipt }
									disabled={ sendEmailMutation.isPending }
								/>
							),
						}
					) }
				</Text>
			</VStack>
		</VStack>
	);
}

function VatVendorDetails( { receipt }: { receipt: Receipt } ) {
	const vendorInfo = receipt.tax_vendor_info;
	if ( ! vendorInfo ) {
		return null;
	}

	return (
		<VStack spacing={ 1 } alignment="flex-start">
			<Text upperCase variant="muted" size={ 11 }>
				{ sprintf(
					/* translators: %s: tax name (e.g., "VAT", "GST") */
					__( 'Vendor %s Details' ),
					Object.keys( vendorInfo.tax_name_and_vendor_id_array ).join( '/' )
				) }
			</Text>
			<VStack spacing={ 0.5 } alignment="flex-start">
				{ vendorInfo.address.map( ( addressLine ) => (
					<div key={ addressLine }>{ addressLine }</div>
				) ) }
				{ Object.entries( vendorInfo.tax_name_and_vendor_id_array ).map( ( [ taxName, taxID ] ) => (
					<div key={ taxName }>
						<strong>{ taxName }</strong> { taxID }
					</div>
				) ) }
			</VStack>
		</VStack>
	);
}

function VatDetails( { receipt }: { receipt: Receipt } ) {
	return (
		<>
			<UserVatDetails receipt={ receipt } />
			<VatVendorDetails receipt={ receipt } />
		</>
	);
}

function isUserVisibleCostOverride( costOverride: {
	does_override_original_cost: boolean;
	override_code: string;
} ): boolean {
	if ( costOverride.does_override_original_cost ) {
		// We won't display original cost overrides since they are
		// included in the original cost that's being displayed. They
		// are not discounts.
		return false;
	}
	return true;
}

function getPaymentMethodText( receipt: Receipt ): string | null {
	if (
		receipt.pay_part === PaymentPartners.PAYPAL_EXPRESS ||
		receipt.pay_part === PaymentPartners.PAYPAL_PPCP
	) {
		return __( 'PayPal' );
	}

	if ( receipt.cc_num !== 'XXXX' ) {
		const cardType =
			receipt.cc_display_brand?.replace( '_', ' ' ).toUpperCase() ?? receipt.cc_type.toUpperCase();
		/* translators: 1: card type (e.g., "VISA"), 2: last 4 digits of card */
		return sprintf( __( '%1$s ending in %2$s' ), cardType, receipt.cc_num );
	}

	return null;
}

function ReceiptLineItems( { receipt }: { receipt: Receipt } ) {
	const groupedItems = groupDomainProducts( receipt.items );

	return (
		<VStack spacing={ 4 } alignment="flex-start">
			<Text weight={ 500 } size={ 15 }>
				{ __( 'Order summary' ) }
			</Text>
			<VStack className="receipt-table">
				<HStack justify="space-between" className="receipt-table-header">
					<Text upperCase variant="muted" size={ 11 }>
						{ __( 'Description' ) }
					</Text>
					<Text upperCase variant="muted" size={ 11 }>
						{ __( 'Amount' ) }
					</Text>
				</HStack>
				<Divider />
				<VStack className="receipt-table-body">
					<VStack spacing={ 4 }>
						{ groupedItems.map( ( item ) => (
							<ReceiptLineItem key={ item.id } item={ item } receipt={ receipt } />
						) ) }
					</VStack>
					{ transactionIncludesTax( receipt ) && (
						<VStack className="receipt-tax-row">
							<HStack justify="space-between">
								<span>{ __( 'Tax' ) }</span>
								<span>{ formatReceiptTaxAmount( receipt ) }</span>
							</HStack>
						</VStack>
					) }
				</VStack>
				<Divider />
				<VStack className="receipt-total-row">
					<HStack justify="space-between">
						<Text weight={ 500 }>{ __( 'Total paid:' ) }</Text>
						<Text weight={ 500 }>{ formatReceiptAmount( receipt ) }</Text>
					</HStack>
				</VStack>
			</VStack>
		</VStack>
	);
}

function ReceiptLineItem( { item, receipt }: { item: ReceiptItem; receipt: Receipt } ) {
	const termLabel = getTransactionTermLabel( item );
	const shouldShowDiscount = areReceiptItemDiscountsAccurate( receipt.date );
	const subtotalInteger = shouldShowDiscount
		? getReceiptItemOriginalCost( item )
		: item.subtotal_integer;
	const formattedAmount = formatCurrency( subtotalInteger, item.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	return (
		<VStack className="receipt-line-item">
			<HStack justify="space-between" alignment="flex-start">
				<VStack className="receipt-line-item-cell">
					<VStack spacing={ 1 } alignment="flex-start">
						<Text weight={ 500 }>
							{ item.variation } ({ item.type_localized.toLowerCase() })
						</Text>
						<VStack spacing={ 0 }>
							{ termLabel && <Text>{ termLabel }</Text> }
							{ item.domain && <Text variant="muted">{ item.domain }</Text> }
							{ item.licensed_quantity && (
								<Text>{ renderTransactionQuantitySummary( item ) }</Text>
							) }
							{ isTransactionJetpackSearch10kTier( item ) && (
								<Text>{ renderJetpackSearch10kTierBreakdown( item, subtotalInteger ) }</Text>
							) }
							<DomainTransactionVolumeSummary item={ item } />
						</VStack>
					</VStack>
				</VStack>
				<VStack className="receipt-line-item-cell-price">
					<Text>
						{ doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
							item.cost_overrides,
							item.introductory_offer_terms,
							item.months_per_renewal_interval
						) ? (
							<s>{ formattedAmount }</s>
						) : (
							formattedAmount
						) }
					</Text>
					{ receipt.credit && <Text>{ __( 'Refund' ) }</Text> }
				</VStack>
			</HStack>
			{ shouldShowDiscount && (
				<div className="receipt-discount-cell">
					<ReceiptItemDiscounts item={ item } receiptDate={ receipt.date } />
				</div>
			) }
		</VStack>
	);
}

function ReceiptItemDiscounts( { item, receiptDate }: { item: ReceiptItem; receiptDate: string } ) {
	const shouldShowDiscount = areReceiptItemDiscountsAccurate( receiptDate );

	return (
		<ul className="receipt-discount-list">
			{ filterCostOverridesForReceiptItem( item ).map( ( costOverride ) => {
				const formattedDiscountAmount =
					shouldShowDiscount && costOverride.discountAmount
						? formatCurrency( -costOverride.discountAmount, item.currency, {
								isSmallestUnit: true,
								stripZeros: true,
						  } )
						: '';

				if (
					doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
						item.cost_overrides,
						item.introductory_offer_terms,
						item.months_per_renewal_interval
					)
				) {
					return (
						<li key={ costOverride.humanReadableReason }>
							<Text>{ costOverride.humanReadableReason }</Text>
							{ item.introductory_offer_terms?.enabled && (
								<Text>
									{ sprintf(
										/* translators: %s: formatted price */
										__( 'Amount paid in transaction: %s' ),
										formatCurrency( item.amount_integer, item.currency, {
											isSmallestUnit: true,
											stripZeros: true,
										} )
									) }
								</Text>
							) }
						</li>
					);
				}

				return (
					<li key={ costOverride.humanReadableReason }>
						<Flex justify="space-between">
							<span>{ costOverride.humanReadableReason }</span>
							<span>{ formattedDiscountAmount }</span>
						</Flex>
					</li>
				);
			} ) }
		</ul>
	);
}

function filterCostOverridesForReceiptItem( item: ReceiptItem ): LineItemCostOverrideForDisplay[] {
	return item.cost_overrides
		.filter( ( costOverride ) => isUserVisibleCostOverride( costOverride ) )
		.map( ( costOverride ) => makeIntroductoryOfferCostOverrideUnique( costOverride, item ) )
		.map( ( costOverride ) => {
			if (
				doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
					item.cost_overrides,
					item.introductory_offer_terms,
					item.months_per_renewal_interval
				)
			) {
				return {
					humanReadableReason: costOverride.human_readable_reason,
					overrideCode: costOverride.override_code,
				};
			}
			return {
				humanReadableReason: costOverride.human_readable_reason,
				overrideCode: costOverride.override_code,
				discountAmount: costOverride.old_price_integer - costOverride.new_price_integer,
			};
		} );
}

function makeIntroductoryOfferCostOverrideUnique(
	costOverride: ReceiptItemCostOverride,
	product: ReceiptItem
): ReceiptItemCostOverride {
	if ( 'introductory-offer' === costOverride.override_code && product.introductory_offer_terms ) {
		return {
			...costOverride,
			human_readable_reason: getDiscountReasonForIntroductoryOffer(
				product,
				product.introductory_offer_terms,
				true,
				costOverride.new_price_integer > costOverride.old_price_integer
			),
		};
	}
	return costOverride;
}

function getIntroductoryOfferIntervalDisplay( {
	intervalUnit,
	intervalCount,
	isFreeTrial,
	isPriceIncrease,
	context,
	remainingRenewalsUsingOffer = 0,
}: {
	intervalUnit: string;
	intervalCount: number;
	isFreeTrial: boolean;
	isPriceIncrease: boolean;
	context: string;
	remainingRenewalsUsingOffer: number;
} ): string {
	let text = isPriceIncrease ? __( 'First billing period' ) : __( 'Discount for first period' );

	if ( isFreeTrial ) {
		if ( intervalUnit === 'month' ) {
			if ( intervalCount === 1 ) {
				text = __( 'First month free' );
			} else {
				text = sprintf(
					/* translators: %d: number of months */
					__( 'First %d months free' ),
					intervalCount
				);
			}
		}
		if ( intervalUnit === 'year' ) {
			if ( intervalCount === 1 ) {
				text = __( 'First year free' );
			} else {
				text = sprintf(
					/* translators: %d: number of years */
					__( 'First %d years free' ),
					intervalCount
				);
			}
		}
	} else {
		if ( intervalUnit === 'month' ) {
			if ( intervalCount === 1 ) {
				text = isPriceIncrease ? __( 'Price for first month' ) : __( 'Discount for first month' );
			} else {
				text = isPriceIncrease
					? sprintf(
							/* translators: %d: number of months */
							__( 'Price for first %d months' ),
							intervalCount
					  )
					: sprintf(
							/* translators: %d: number of months */
							__( 'Discount for first %d months' ),
							intervalCount
					  );
			}
		}
		if ( intervalUnit === 'year' ) {
			if ( intervalCount === 1 ) {
				text = isPriceIncrease ? __( 'Price for first year' ) : __( 'Discount for first year' );
			} else {
				text = isPriceIncrease
					? sprintf(
							/* translators: %d: number of years */
							__( 'Price for first %d years' ),
							intervalCount
					  )
					: sprintf(
							/* translators: %d: number of years */
							__( 'Discount for first %d years' ),
							intervalCount
					  );
			}
		}
	}

	if ( remainingRenewalsUsingOffer > 0 ) {
		text += ' - ';
		if ( context === 'checkout' ) {
			if ( remainingRenewalsUsingOffer === 1 ) {
				text += isPriceIncrease
					? __( 'Applies for one renewal' )
					: __( 'The first renewal is also discounted.' );
			} else if ( isPriceIncrease ) {
				text += sprintf(
					/* translators: %d: number of renewals */
					__( 'Applies for %d renewals' ),
					remainingRenewalsUsingOffer
				);
			} else {
				text +=
					remainingRenewalsUsingOffer === 1
						? __( 'The first renewal is also discounted.' )
						: sprintf(
								/* translators: %d: number of renewals */
								__( 'The first %d renewals are also discounted.' ),
								remainingRenewalsUsingOffer
						  );
			}
		} else if ( isPriceIncrease ) {
			text +=
				remainingRenewalsUsingOffer === 1
					? __( 'Applies for 1 renewal' )
					: sprintf(
							/* translators: %d: number of renewals */
							__( 'Applies for %d renewals' ),
							remainingRenewalsUsingOffer
					  );
		} else {
			text +=
				remainingRenewalsUsingOffer === 1
					? __( '1 discounted renewal remaining.' )
					: sprintf(
							/* translators: %d: number of renewals */
							__( '%d discounted renewals remaining.' ),
							remainingRenewalsUsingOffer
					  );
		}
	}

	return text;
}

function getDiscountReasonForIntroductoryOffer(
	product: ReceiptItem,
	terms: IntroductoryOfferTerms,
	allowFreeText: boolean,
	isPriceIncrease: boolean
): string {
	return getIntroductoryOfferIntervalDisplay( {
		intervalUnit: terms.interval_unit,
		intervalCount: terms.interval_count,
		isFreeTrial: product.amount_integer === 0 && allowFreeText,
		isPriceIncrease,
		context: 'checkout',
		remainingRenewalsUsingOffer: terms.transition_after_renewal_count,
	} );
}

function areReceiptItemDiscountsAccurate( receiptDate: string ): boolean {
	const date = new Date( receiptDate );
	const receiptDateUnix = date.getTime() / 1000;
	const receiptTagsAccurateAsOf = 1704218040;
	return receiptDateUnix > receiptTagsAccurateAsOf;
}

function getReceiptItemOriginalCost( item: ReceiptItem ): number {
	if ( item.type === 'refund' ) {
		return item.subtotal_integer;
	}
	const originalCostOverrides = item.cost_overrides.filter(
		( override ) => override.does_override_original_cost
	);
	if ( originalCostOverrides.length > 0 ) {
		const lastOriginalCostOverride = originalCostOverrides.pop();
		if ( lastOriginalCostOverride ) {
			return lastOriginalCostOverride.new_price_integer;
		}
	}
	if ( item.cost_overrides.length > 0 ) {
		const firstOverride = item.cost_overrides[ 0 ];
		if ( firstOverride ) {
			return firstOverride.old_price_integer;
		}
	}
	return item.subtotal_integer;
}
