import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Card, FormLabel } from '@automattic/components';
import { IntroductoryOfferTerms } from '@automattic/shopping-cart';
import {
	LineItemCostOverrideForDisplay,
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
	getIntroductoryOfferIntervalDisplay,
	isUserVisibleCostOverride,
} from '@automattic/wpcom-checkout';
import clsx from 'clsx';
import { formatCurrency, localize, useTranslate } from 'i18n-calypso';
import { Component, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import HeaderCake from 'calypso/components/header-cake';
import { withLocalizedMoment, useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { PARTNER_PAYPAL_EXPRESS, PARTNER_PAYPAL_PPCP } from 'calypso/lib/checkout/payment-methods';
import { billingHistory, vatDetails as vatDetailsPath } from 'calypso/me/purchases/paths';
import titles from 'calypso/me/purchases/titles';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import {
	clearBillingTransactionError,
	requestBillingTransaction,
} from 'calypso/state/billing-transactions/individual-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	renderTransactionQuantitySummary,
	renderDomainTransactionVolumeSummary,
	transactionIncludesTax,
	isTransactionJetpackSearch10kTier,
	renderJetpackSearch10kTierBreakdown,
} from './utils';
import { VatVendorDetails } from './vat-vendor-details';
import type {
	BillingTransaction,
	BillingTransactionItem,
	ReceiptCostOverride,
} from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';
import type { LocalizeProps } from 'i18n-calypso';
import type { FormEvent } from 'react';

import './style.scss';

interface BillingReceiptProps {
	transactionId: number;
	recordGoogleEvent: ( key: string, message: string ) => void;
	clearBillingTransactionError: ( transactionId: number ) => void;
}

interface BillingReceiptConnectedProps {
	transactionFetchError?: string;
	transaction: BillingTransaction | undefined;
	translate: LocalizeProps[ 'translate' ];
}

class BillingReceipt extends Component< BillingReceiptProps & BillingReceiptConnectedProps > {
	componentDidMount() {
		this.redirectIfInvalidTransaction();
	}

	componentDidUpdate() {
		this.redirectIfInvalidTransaction();
	}

	recordClickEvent = ( action: string ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	handlePrintLinkClick = () => {
		this.recordClickEvent( 'Print Receipt Button in Billing History Receipt' );
		window.print();
	};

	redirectIfInvalidTransaction() {
		const { transactionFetchError, transactionId } = this.props;

		if ( ! transactionFetchError ) {
			return;
		}

		this.props.clearBillingTransactionError( transactionId );
		page.redirect( billingHistory );
	}

	render() {
		const { transaction, transactionId, translate } = this.props;

		return (
			<Main wideLayout className="receipt">
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/billing/:receipt"
					title="Me > Billing History > Receipt"
				/>

				<NavigationHeader navigationItems={ [] } title={ titles.sectionTitle } />

				<QueryBillingTransaction transactionId={ transactionId } />

				<ReceiptTitle backHref={ billingHistory } />

				{ transaction ? (
					<ReceiptBody
						transaction={ transaction }
						handlePrintLinkClick={ this.handlePrintLinkClick }
					/>
				) : (
					<ReceiptPlaceholder />
				) }
			</Main>
		);
	}
}

export function ReceiptBody( {
	transaction,
	handlePrintLinkClick,
}: {
	transaction: BillingTransaction;
	handlePrintLinkClick: () => void;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const title = translate( 'Visit %(url)s', { args: { url: transaction.url }, textOnly: true } );
	const serviceLink = <a href={ transaction.url } title={ title } />;

	const membershipServiceHeader = translate(
		'{{link}}%(service)s{{/link}} {{small}}Payment processed by %(organization)s{{/small}}',
		{
			components: {
				link: serviceLink,
				small: <small />,
			},
			args: {
				service: transaction.service,
				organization: transaction.org,
			},
			comment:
				'This string is "Service Payment processed by Organization". ' +
				'The {{link}} and {{small}} add html styling and attributes. ' +
				'Screenshot: https://cloudup.com/isX-WEFYlOs',
		}
	);

	const connectedServiceHeader = translate(
		'{{link}}%(service)s{{/link}} {{small}}by %(organization)s{{/small}}',
		{
			components: {
				link: serviceLink,
				small: <small />,
			},
			args: {
				service: transaction.service,
				organization: transaction.org,
			},
			comment:
				'This string is "Service by Organization". ' +
				'The {{link}} and {{small}} add html styling and attributes. ' +
				'Screenshot: https://cloudup.com/isX-WEFYlOs',
		}
	);

	return (
		<div>
			<Card compact className="billing-history__receipt-card">
				<div className="billing-history__app-overview">
					<img src={ transaction.icon } title={ transaction.service } alt={ transaction.service } />
					<h2>
						{ 'memberships' === transaction.service_slug
							? membershipServiceHeader
							: connectedServiceHeader }
						<small className="billing-history__organization-address">{ transaction.address }</small>
					</h2>
					<span className="billing-history__transaction-date">
						{ moment( transaction.date ).format( 'll' ) }
					</span>
				</div>
				<ul className="billing-history__receipt-details group">
					<li>
						<strong>{ translate( 'Receipt ID' ) }</strong>
						<span className="receipt__monospace">{ transaction.id }</span>
					</li>
					<ReceiptTransactionId transaction={ transaction } />
					<ReceiptPaymentMethod transaction={ transaction } />
					{ transaction.cc_num !== 'XXXX' ? (
						<ReceiptDetails transaction={ transaction } />
					) : (
						<EmptyReceiptDetails />
					) }
					{ config.isEnabled( 'me/vat-details' ) && <VatDetails transaction={ transaction } /> }
				</ul>
				<ReceiptLineItems transaction={ transaction } />

				<div className="billing-history__receipt-links">
					<Button primary onClick={ handlePrintLinkClick }>
						{ translate( 'Print Receipt' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
}

function ReceiptTransactionId( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	if ( ! transaction.pay_ref ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Transaction ID' ) }</strong>
			<span className="receipt__monospace">{ transaction.pay_ref }</span>
		</li>
	);
}

function ReceiptPaymentMethod( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	let text;

	if (
		transaction.pay_part === PARTNER_PAYPAL_EXPRESS ||
		transaction.pay_part === PARTNER_PAYPAL_PPCP
	) {
		text = translate( 'PayPal' );
	} else if ( 'XXXX' !== transaction.cc_num ) {
		text = translate( '%(cardType)s ending in %(cardNum)s', {
			args: {
				cardType:
					transaction.cc_display_brand?.replace( '_', ' ' ).toUpperCase() ??
					transaction.cc_type.toUpperCase(),
				cardNum: transaction.cc_num,
			},
		} );
	} else {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Payment Method' ) }</strong>
			<span>{ text }</span>
		</li>
	);
}

function UserVatDetails( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const { vatDetails, isLoading, fetchError } = useVatDetails();
	const reduxDispatch = useDispatch();

	const getEmailReceiptLinkClickHandler = ( receiptId: string ) => {
		return ( event: FormEvent< HTMLFormElement > ) => {
			event.preventDefault();
			reduxDispatch( recordGoogleEvent( 'Me', 'Clicked on Receipt Email Button' ) );
			reduxDispatch( sendBillingReceiptEmail( receiptId ) );
		};
	};

	if ( isLoading || fetchError || ! vatDetails.id ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'VAT Details' ) }</strong>
			<span className="receipt__vat-vendor-details-description">
				{ translate(
					'{{noPrint}}You can edit your VAT details {{vatDetailsLink}}on this page{{/vatDetailsLink}}. {{/noPrint}}This is not an official VAT receipt. For an official VAT receipt, {{emailReceiptLink}}email yourself a copy{{/emailReceiptLink}}.',
					{
						components: {
							noPrint: <span className="receipt__no-print" />,
							vatDetailsLink: <a href={ vatDetailsPath } />,
							emailReceiptLink: (
								<Button
									plain
									className="receipt__email-button"
									onClick={ getEmailReceiptLinkClickHandler( transaction.id ) as any }
								/>
							),
						},
					}
				) }
			</span>
			{ vatDetails.name }
			<br />
			{ vatDetails.address }
			<br />
			{ translate( 'VAT #: %(vatCountry)s %(vatId)s', {
				args: {
					vatCountry: vatDetails.country ?? '',
					vatId: vatDetails.id,
				},
				comment: 'This is the user-supplied VAT number, format "UK 553557881".',
			} ) }
		</li>
	);
}

function VatDetails( { transaction }: { transaction: BillingTransaction } ) {
	return (
		<>
			<UserVatDetails transaction={ transaction } />
			<VatVendorDetails transaction={ transaction } />
		</>
	);
}

function getDiscountReasonForIntroductoryOffer(
	product: BillingTransactionItem,
	terms: IntroductoryOfferTerms,
	translate: ReturnType< typeof useTranslate >,
	allowFreeText: boolean,
	isPriceIncrease: boolean
): string {
	return getIntroductoryOfferIntervalDisplay( {
		translate,
		intervalUnit: terms.interval_unit,
		intervalCount: terms.interval_count,
		isFreeTrial: product.amount_integer === 0 && allowFreeText,
		isPriceIncrease,
		context: 'checkout',
		remainingRenewalsUsingOffer: terms.transition_after_renewal_count,
	} );
}

function makeIntroductoryOfferCostOverrideUnique(
	costOverride: ReceiptCostOverride,
	product: BillingTransactionItem,
	translate: ReturnType< typeof useTranslate >
): ReceiptCostOverride {
	// Replace introductory offer cost override text with wording specific to
	// that offer.
	if ( 'introductory-offer' === costOverride.override_code && product.introductory_offer_terms ) {
		return {
			...costOverride,
			human_readable_reason: getDiscountReasonForIntroductoryOffer(
				product,
				product.introductory_offer_terms,
				translate,
				true,
				costOverride.new_price_integer > costOverride.old_price_integer
			),
		};
	}
	return costOverride;
}

function filterCostOverridesForReceiptItem(
	item: BillingTransactionItem,
	translate: ReturnType< typeof useTranslate >
): LineItemCostOverrideForDisplay[] {
	return item.cost_overrides
		.filter( ( costOverride ) => isUserVisibleCostOverride( costOverride ) )
		.map( ( costOverride ) =>
			makeIntroductoryOfferCostOverrideUnique( costOverride, item, translate )
		)
		.map( ( costOverride ) => {
			// Introductory offer discounts with term lengths that differ from
			// the term length of the product (eg: a 3 month discount for an
			// annual plan) need to be displayed differently because the
			// discount is only temporary and the user will still be charged
			// the remainder before the next renewal.
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

function areReceiptItemDiscountsAccurate( receiptDate: string ): boolean {
	const date = new Date( receiptDate );
	const receiptDateUnix = date.getTime() / 1000;
	// D129863-code and D133350-code fixed volume discounts. Before that, cost
	// override tags may be incomplete. The latter was merged on Jan 2, 2024,
	// 17:54 UTC.
	const receiptTagsAccurateAsOf = 1704218040;
	return receiptDateUnix > receiptTagsAccurateAsOf;
}

function ReceiptItemDiscountIntroductoryOfferDate( { item }: { item: BillingTransactionItem } ) {
	const translate = useTranslate();
	if ( ! item.introductory_offer_terms?.enabled ) {
		return null;
	}
	if (
		! doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
			item.cost_overrides,
			item.introductory_offer_terms,
			item.months_per_renewal_interval
		)
	) {
		return null;
	}

	return (
		<div>
			<div>
				{ translate( 'Amount paid in transaction: %(price)s', {
					args: {
						price: formatCurrency( item.amount_integer, item.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
			</div>
		</div>
	);
}

function ReceiptItemDiscounts( {
	item,
	receiptDate,
}: {
	item: BillingTransactionItem;
	receiptDate: string;
} ) {
	const shouldShowDiscount = areReceiptItemDiscountsAccurate( receiptDate );
	const translate = useTranslate();
	return (
		<ul className="billing-history__receipt-item-discounts-list">
			{ filterCostOverridesForReceiptItem( item, translate ).map( ( costOverride ) => {
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
						<li
							key={ costOverride.humanReadableReason }
							className="billing-history__receipt-item-discount billing-history__receipt-item-discount--different-term"
						>
							<div>{ costOverride.humanReadableReason }</div>
							<ReceiptItemDiscountIntroductoryOfferDate item={ item } />
						</li>
					);
				}
				return (
					<li
						key={ costOverride.humanReadableReason }
						className="billing-history__receipt-item-discount"
					>
						<span>{ costOverride.humanReadableReason }</span>
						<span>{ formattedDiscountAmount }</span>
					</li>
				);
			} ) }
		</ul>
	);
}

/**
 * Calculate the original cost for a receipt item by looking at any cost
 * overrides.
 *
 * Returns the number in the currency's smallest unit.
 */
function getReceiptItemOriginalCost( item: BillingTransactionItem ): number {
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

function ReceiptItemTaxes( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const taxName = useTaxName( transaction.tax_country_code );

	if ( ! transactionIncludesTax( transaction ) ) {
		return null;
	}

	return (
		<div className="billing-history__transaction-tax-amount">
			<span>{ taxName ?? translate( 'Tax' ) }</span>
			<span>
				{ formatCurrency( transaction.tax_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</span>
		</div>
	);
}

function ReceiptLineItem( {
	item,
	transaction,
}: {
	item: BillingTransactionItem;
	transaction: BillingTransaction;
} ) {
	const translate = useTranslate();
	const termLabel = getTransactionTermLabel( item, translate );
	const shouldShowDiscount = areReceiptItemDiscountsAccurate( transaction.date );
	const subtotal_integer = shouldShowDiscount
		? getReceiptItemOriginalCost( item )
		: item.subtotal_integer;
	const formattedAmount = formatCurrency( subtotal_integer, item.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	return (
		<>
			<tr>
				<td className="billing-history__receipt-item-name">
					<span>{ item.variation }</span>
					<small>({ item.type_localized })</small>
					{ termLabel && <em>{ termLabel }</em> }
					{ item.domain && <em>{ item.domain }</em> }
					{ item.licensed_quantity && (
						<em>{ renderTransactionQuantitySummary( item, translate ) }</em>
					) }
					{ isTransactionJetpackSearch10kTier( item ) && (
						<em>{ renderJetpackSearch10kTierBreakdown( item, subtotal_integer, translate ) }</em>
					) }
					{ item.volume && <em>{ renderDomainTransactionVolumeSummary( item, translate ) }</em> }
				</td>
				<td className="billing-history__receipt-amount">
					{ doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
						item.cost_overrides,
						item.introductory_offer_terms,
						item.months_per_renewal_interval
					) ? (
						<s>{ formattedAmount }</s>
					) : (
						formattedAmount
					) }
					{ transaction.credit && (
						<span className="billing-history__credit-badge">{ translate( 'Refund' ) }</span>
					) }
				</td>
			</tr>
			<tr>
				<td className="billing-history__receipt-item-discounts" colSpan={ 2 }>
					<ReceiptItemDiscounts item={ item } receiptDate={ transaction.date } />
				</td>
			</tr>
		</>
	);
}

function ReceiptLineItems( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const groupedTransactionItems = groupDomainProducts( transaction.items, translate );

	return (
		<div className="billing-history__receipt">
			<h4>{ translate( 'Order summary' ) }</h4>
			<table className="billing-history__receipt-line-items">
				<thead>
					<tr>
						<th className="billing-history__receipt-desc">{ translate( 'Description' ) }</th>
						<th className="billing-history__receipt-amount">{ translate( 'Amount' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ groupedTransactionItems.map( ( item ) => (
						<ReceiptLineItem key={ item.id } transaction={ transaction } item={ item } />
					) ) }
					<tr>
						<td colSpan={ 2 }>
							<ReceiptItemTaxes transaction={ transaction } />
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td className="billing-history__receipt-desc">
							<strong>
								{ translate( 'Total paid:', { comment: 'Total amount paid for product' } ) }
							</strong>
						</td>
						<td
							className={
								'billing-history__receipt-amount billing-history__total-amount ' +
								transaction.credit
							}
						>
							{ formatCurrency( transaction.amount_integer, transaction.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ) }
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}

function ReceiptDetails( { transaction }: { transaction: BillingTransaction } ) {
	if ( ! transaction.cc_name && ! transaction.cc_email ) {
		return null;
	}

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
				defaultValue={ transaction.cc_name + '\n' + transaction.cc_email }
			/>
		</li>
	);
}

function EmptyReceiptDetails() {
	// When the content of the text area is empty, hide the "Billing Details" label for printing.
	const [ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ] = useState( true );
	const onChange = useCallback(
		( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
			const value = e.target.value.trim();
			if ( hideDetailsLabelOnPrint && value.length > 0 ) {
				setHideDetailsLabelOnPrint( false );
			} else if ( ! hideDetailsLabelOnPrint && value.length === 0 ) {
				setHideDetailsLabelOnPrint( true );
			}
		},
		[ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ]
	);

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels hideDetailsLabelOnPrint={ hideDetailsLabelOnPrint } />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
				onChange={ onChange }
			/>
		</li>
	);
}

export function ReceiptPlaceholder() {
	return (
		<Card compact className="billing-history__receipt-card is-placeholder">
			<div className="billing-history__app-overview">
				<div className="billing-history__placeholder-image" />
				<div className="billing-history__placeholder-title" />
			</div>

			<div className="billing-history__receipt-links">
				<div className="billing-history__placeholder-link" />
				<div className="billing-history__placeholder-link" />
			</div>
		</Card>
	);
}

function ReceiptLabels( { hideDetailsLabelOnPrint }: { hideDetailsLabelOnPrint?: boolean } ) {
	const translate = useTranslate();

	let labelContent = translate(
		'Use this field to add your billing information (eg. VAT number, business address) before printing.'
	);
	if ( config.isEnabled( 'me/vat-details' ) ) {
		labelContent = translate(
			'Use this field to add your billing information (eg. business address) before printing.'
		);
	}
	return (
		<div>
			<FormLabel
				htmlFor="billing-history__billing-details-textarea"
				className={ clsx( { 'receipt__no-print': hideDetailsLabelOnPrint } ) }
			>
				{ translate( 'Billing Details' ) }
			</FormLabel>
			<div
				className="billing-history__billing-details-description"
				id="billing-history__billing-details-description"
			>
				{ labelContent }
			</div>
		</div>
	);
}

export function ReceiptTitle( { backHref }: { backHref: string } ) {
	const translate = useTranslate();
	return <HeaderCake backHref={ backHref }>{ translate( 'Receipt' ) }</HeaderCake>;
}

export default connect(
	( state: IAppState, { transactionId }: { transactionId: number } ) => {
		const transaction = getPastBillingTransaction( state, transactionId );
		return {
			transaction: transaction && 'service' in transaction ? transaction : undefined,
			transactionFetchError: isPastBillingTransactionError( state, transactionId ),
		};
	},
	{
		clearBillingTransactionError,
		recordGoogleEvent,
		requestBillingTransaction,
	}
)( localize( withLocalizedMoment( BillingReceipt ) ) );
