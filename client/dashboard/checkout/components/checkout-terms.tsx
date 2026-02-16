import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { DOMAIN_CANCEL, EDIT_PAYMENT_DETAILS, REFUNDS } from '@automattic/urls';
import {
	ExternalLink,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { wpcomLink } from '../../utils/link';
import type {
	ResponseCart,
	ResponseCartProduct,
	TermsOfServiceRecord,
	TermsOfServiceRecordArgsBase,
	TermsOfServiceRecordArgsRenewal,
} from '@automattic/shopping-cart';

// ---------------------------------------------------------------------------
// Product-type helpers (avoids importing @automattic/calypso-products)
// ---------------------------------------------------------------------------

/** Bill-period constants (in days) */
const BILL_PERIOD_MONTHLY = 31;
const BILL_PERIOD_YEARLY = 365;
const BILL_PERIOD_BIENNIAL = 730;
const BILL_PERIOD_TRIENNIAL = 1095;
const BILL_PERIOD_CENTENNIAL = 36500;

function isProductRenewal( product: ResponseCartProduct ): boolean {
	return !! ( product.is_renewal || product.extra?.purchaseType === 'renewal' );
}

function isDomainTransfer( product: ResponseCartProduct ): boolean {
	return product.product_slug === 'domain_transfer';
}

/**
 * Returns true if any product in the cart creates a renewable subscription
 * (i.e. has a recurring billing period, not a one-time purchase).
 *
 * Domain transfers count as renewable because they create a subscription behind
 * the scenes, even though the transfer itself is a one-time action.
 */
function hasRenewableSubscription( cart: ResponseCart ): boolean {
	return cart.products.some(
		( product ) => parseInt( product.bill_period, 10 ) !== -1 || isDomainTransfer( product )
	);
}

// ---------------------------------------------------------------------------
// Terms of Service
// ---------------------------------------------------------------------------

function TermsOfService( {
	hasRenewable,
	isGiftPurchase,
}: {
	hasRenewable: boolean;
	isGiftPurchase: boolean;
} ) {
	if ( isGiftPurchase || ! hasRenewable ) {
		return (
			<Text>
				{ createInterpolateElement( __( 'You agree to our <tosLink>Terms of Service</tosLink>.' ), {
					tosLink: (
						<ExternalLink
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							children={ undefined }
						/>
					),
				} ) }
			</Text>
		);
	}

	return (
		<Text>
			{ createInterpolateElement(
				__(
					'You agree to our <tosLink>Terms of Service</tosLink> and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand <autoRenewalLink>how your subscription works</autoRenewalLink> and <cancelLink>how to cancel</cancelLink>.'
				),
				{
					tosLink: (
						<ExternalLink
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							children={ undefined }
						/>
					),
					autoRenewalLink: (
						<InlineSupportLink supportContext="autorenewal">
							{ __( 'how your subscription works' ) }
						</InlineSupportLink>
					),
					cancelLink: (
						<InlineSupportLink supportContext="cancel_purchase">
							{ __( 'how to cancel' ) }
						</InlineSupportLink>
					),
				}
			) }
		</Text>
	);
}

// ---------------------------------------------------------------------------
// Additional Terms of Service (promotional/bundled trial info from the cart)
// ---------------------------------------------------------------------------

function formatDate( isoDate: string ): string {
	return new Date( Date.parse( isoDate ) ).toLocaleDateString( 'en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	} );
}

function isArgsRenewal(
	args: TermsOfServiceRecordArgsBase | TermsOfServiceRecordArgsRenewal
): args is TermsOfServiceRecordArgsRenewal {
	return 'subscription_expiry_date' in args && Boolean( args.subscription_expiry_date );
}

function AdditionalTermsMessage( {
	record,
	siteSlug,
	currency,
}: {
	record: TermsOfServiceRecord;
	siteSlug: string;
	currency: string;
} ) {
	if ( record.code !== 'terms_for_bundled_trial_unknown_payment_method' ) {
		return null;
	}

	const args = record.args;
	if ( ! args ) {
		return null;
	}

	const productName = args.product_name + ( args.product_meta ? ` (${ args.product_meta })` : '' );

	const formatPrice = ( amount: number ) =>
		formatCurrency( amount, currency, { isSmallestUnit: true, stripZeros: true } );

	const renewalPrice = formatPrice( args.renewal_price_integer );
	const regularPrice = formatPrice( args.regular_renewal_price_integer );
	const maybeProratedRegularPrice = formatPrice(
		args.maybe_prorated_regular_renewal_price_integer
	);
	const manageSubscriptionLink = wpcomLink( `/purchases/subscriptions/${ siteSlug }` );

	if ( isArgsRenewal( args ) ) {
		const promotionEndDate = formatDate( args.subscription_end_of_promotion_date );
		const subscriptionEndDate = formatDate( args.subscription_expiry_date );
		const numberOfDays = args.subscription_pre_renew_reminder_days || 7;
		const renewalDate = formatDate( args.subscription_auto_renew_date );
		const proratedRenewalDate = formatDate(
			args.subscription_maybe_prorated_regular_auto_renew_date
		);

		const shouldShowEndOfPromotionText =
			renewalDate !== proratedRenewalDate || renewalPrice !== maybeProratedRegularPrice;

		const shouldShowRegularPriceNoticeText = ( () => {
			if ( ! shouldShowEndOfPromotionText && regularPrice === renewalPrice ) {
				return false;
			}
			if ( shouldShowEndOfPromotionText && regularPrice === maybeProratedRegularPrice ) {
				return false;
			}
			return true;
		} )();

		const shouldShowRenewalTermText =
			args.is_renewal && args.remaining_promotional_auto_renewals === 0;

		// translators: %(productName)s is the product name, %(endDate)s is the subscription end date.
		const renewalTermLengthText = __(
			'After you renew today, your %(productName)s subscription will last until %(endDate)s.'
		)
			.replace( '%(productName)s', productName )
			.replace( '%(endDate)s', subscriptionEndDate );

		// translators: %(productName)s is the product name, %(startDate)s is the promo start date, %(endDate)s is the promo end date.
		const promoTermLengthText = __(
			'The promotional period for your %(productName)s subscription lasts from %(startDate)s to %(endDate)s.'
		)
			.replace( '%(productName)s', productName )
			.replace( '%(startDate)s', formatDate( args.subscription_start_date ) )
			.replace( '%(endDate)s', promotionEndDate );

		const termLengthText = shouldShowRenewalTermText ? renewalTermLengthText : promoTermLengthText;

		// translators: %(renewalPrice)s is the formatted renewal price, %(renewalDate)s is the next renewal date.
		const nextRenewalText = __( 'You will next be charged %(renewalPrice)s on %(renewalDate)s.' )
			.replace( '%(renewalPrice)s', renewalPrice )
			.replace( '%(renewalDate)s', renewalDate );

		// translators: %(endDate)s is the end-of-promotion date, %(maybeProratedRegularPrice)s is the prorated price.
		const endOfPromotionChargeText = __(
			'On %(endDate)s, we will attempt to renew your subscription for %(maybeProratedRegularPrice)s.'
		)
			.replace( '%(endDate)s', proratedRenewalDate )
			.replace( '%(maybeProratedRegularPrice)s', maybeProratedRegularPrice );

		// translators: %(regularPrice)s is the regular (non-promotional) renewal price.
		const regularPriceNoticeText = __( 'Subsequent renewals will be %(regularPrice)s.' ).replace(
			'%(regularPrice)s',
			regularPrice
		);

		const taxesNotIncludedText = __( 'Prices do not include applicable taxes.' );

		return (
			<Text>
				{ termLengthText } { nextRenewalText }{ ' ' }
				{ shouldShowEndOfPromotionText && endOfPromotionChargeText }{ ' ' }
				{ shouldShowRegularPriceNoticeText && regularPriceNoticeText } { taxesNotIncludedText }{ ' ' }
				{ createInterpolateElement(
					// translators: %(numberOfDays)d is the number of days before renewal notification, e.g. 7.
					__(
						'You will receive an email notice %(numberOfDays)d days before being billed, and can <updateLink>update your payment method</updateLink> or <manageLink>manage your subscription</manageLink> at any time.'
					).replace( '%(numberOfDays)d', String( numberOfDays ) ),
					{
						updateLink: <ExternalLink href={ EDIT_PAYMENT_DETAILS } children={ undefined } />,
						manageLink: (
							<a href={ manageSubscriptionLink } target="_blank" rel="noopener noreferrer" />
						),
					}
				) }
			</Text>
		);
	}

	return (
		<Text>
			{ createInterpolateElement(
				// translators: %(productName)s is the product name, %(maybeProratedRegularPrice)s and %(regularPrice)s are prices.
				__(
					'At the end of the promotional period your %(productName)s subscription will renew for %(maybeProratedRegularPrice)s. Subsequent renewals will be %(regularPrice)s. You can add or update your payment method at any time <link>here</link>.'
				)
					.replace( '%(productName)s', productName )
					.replace( '%(maybeProratedRegularPrice)s', maybeProratedRegularPrice )
					.replace( '%(regularPrice)s', regularPrice ),
				{
					link: <a href={ manageSubscriptionLink } target="_blank" rel="noopener noreferrer" />,
				}
			) }
		</Text>
	);
}

function AdditionalTermsOfServiceInCart( {
	cart,
	siteSlug,
}: {
	cart: ResponseCart;
	siteSlug: string;
} ) {
	if ( ! cart.terms_of_service || cart.terms_of_service.length === 0 ) {
		return null;
	}

	return (
		<>
			{ cart.terms_of_service.map( ( record ) => (
				<AdditionalTermsMessage
					key={ record.key }
					record={ record }
					siteSlug={ siteSlug }
					currency={ cart.currency }
				/>
			) ) }
		</>
	);
}

// ---------------------------------------------------------------------------
// Refund policies
// ---------------------------------------------------------------------------

enum RefundPolicy {
	DomainRegistration,
	DomainRegistrationBundled,
	DomainRenewal,
	DomainTransfer,
	Monthly,
	Yearly,
	Biennial,
	Triennial,
	Centennial,
	PlanMonthlyBundle,
	PlanYearlyBundle,
	PlanBiennialBundle,
	PlanTriennialBundle,
}

function getRefundPolicies( cart: ResponseCart ): RefundPolicy[] {
	const policies: ( RefundPolicy | undefined )[] = cart.products.map( ( product ) => {
		// Free products have no refund policy.
		if ( ! product.item_subtotal_integer ) {
			return undefined;
		}

		if ( product.is_domain_registration ) {
			if ( isProductRenewal( product ) ) {
				return RefundPolicy.DomainRenewal;
			}
			// Bundled (free) domains are covered by the plan's bundle policy below.
			if ( product.is_bundled ) {
				return undefined;
			}
			return RefundPolicy.DomainRegistration;
		}

		if ( isDomainTransfer( product ) ) {
			return RefundPolicy.DomainTransfer;
		}

		const billPeriod = parseInt( product.bill_period, 10 );

		if ( product.extra?.domain_to_bundle ) {
			// Plan with an associated bundled domain — show combined refund text.
			if ( billPeriod === BILL_PERIOD_MONTHLY ) {
				return RefundPolicy.PlanMonthlyBundle;
			}
			if ( billPeriod === BILL_PERIOD_YEARLY ) {
				return RefundPolicy.PlanYearlyBundle;
			}
			if ( billPeriod === BILL_PERIOD_BIENNIAL ) {
				return RefundPolicy.PlanBiennialBundle;
			}
			if ( billPeriod === BILL_PERIOD_TRIENNIAL ) {
				return RefundPolicy.PlanTriennialBundle;
			}
		}

		if ( billPeriod === BILL_PERIOD_MONTHLY ) {
			return RefundPolicy.Monthly;
		}
		if ( billPeriod === BILL_PERIOD_YEARLY ) {
			return RefundPolicy.Yearly;
		}
		if ( billPeriod === BILL_PERIOD_BIENNIAL ) {
			return RefundPolicy.Biennial;
		}
		if ( billPeriod === BILL_PERIOD_TRIENNIAL ) {
			return RefundPolicy.Triennial;
		}
		if ( billPeriod === BILL_PERIOD_CENTENNIAL ) {
			return RefundPolicy.Centennial;
		}

		return undefined;
	} );

	// When the cart has a bundled domain purchased separately (not via the plan's bundle),
	// add the bundled-domain refund notice unless the plan bundle already covers it.
	const hasPlanBundlePolicy = policies.some(
		( p ) =>
			p === RefundPolicy.PlanMonthlyBundle ||
			p === RefundPolicy.PlanYearlyBundle ||
			p === RefundPolicy.PlanBiennialBundle ||
			p === RefundPolicy.PlanTriennialBundle
	);
	const hasBundledDomainProduct = cart.products.some(
		( p ) => p.is_domain_registration && p.is_bundled
	);
	if ( ! hasPlanBundlePolicy && hasBundledDomainProduct ) {
		policies.push( RefundPolicy.DomainRegistrationBundled );
	}

	const unique = Array.from( new Set( policies ) ).filter(
		( p ): p is RefundPolicy => p !== undefined
	);

	// Bundle policies already include the domain 96-hour text — remove the
	// standalone domain registration policy to avoid duplicate text.
	const hasBundlePolicy = unique.some(
		( p ) =>
			p === RefundPolicy.DomainRegistrationBundled ||
			p === RefundPolicy.PlanMonthlyBundle ||
			p === RefundPolicy.PlanYearlyBundle ||
			p === RefundPolicy.PlanBiennialBundle ||
			p === RefundPolicy.PlanTriennialBundle
	);
	if ( hasBundlePolicy ) {
		return unique.filter( ( p ) => p !== RefundPolicy.DomainRegistration );
	}

	return unique;
}

function RefundPolicyItem( { policy, cart }: { policy: RefundPolicy; cart: ResponseCart } ) {
	const refundsLink = <ExternalLink href={ REFUNDS } children={ undefined } />;
	const cancelDomainLink = <ExternalLink href={ DOMAIN_CANCEL } children={ undefined } />;

	switch ( policy ) {
		case RefundPolicy.DomainRegistration:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.DomainRegistrationBundled:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.DomainRenewal:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'Please note: to receive a <refundsLink>refund for a domain renewal</refundsLink>, you must <cancelDomainLink>cancel your domain</cancelDomainLink> within 96 hours of the renewal transaction. Canceling the domain means it will be deleted and you may not be able to recover it.'
						),
						{ refundsLink, cancelDomainLink }
					) }
				</Text>
			);

		case RefundPolicy.DomainTransfer:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name transfers are non-refundable</refundsLink> unless the process is canceled before the transfer is completed.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.Monthly:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>refunds</refundsLink> are limited to 7 days after purchase or renewal for non-domain products with monthly subscriptions.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.Yearly:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>refunds</refundsLink> are limited to 14 days after purchase or renewal for non-domain products with yearly subscriptions.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.Biennial:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>refunds</refundsLink> are limited to 14 days after purchase or renewal for non-domain products with two year subscriptions.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.Triennial:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>refunds</refundsLink> are limited to 14 days after purchase or renewal for non-domain products with three year subscriptions.'
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.Centennial:
			return (
				<Text>
					{ createInterpolateElement(
						// translators: %(cost)s is the total cost of the purchase, e.g. "$3,000".
						__(
							'You will be charged %(cost)s and understand that <refundsLink>refunds</refundsLink> are limited to 120 days after purchase.'
						).replace(
							'%(cost)s',
							formatCurrency( cart.total_cost_integer, cart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} )
						),
						{ refundsLink }
					) }
				</Text>
			);

		case RefundPolicy.PlanMonthlyBundle:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration and <refundsLink2>monthly plan refunds</refundsLink2> are limited to 7 days after purchase.'
						),
						{
							refundsLink,
							refundsLink2: <ExternalLink href={ REFUNDS } children={ undefined } />,
						}
					) }
				</Text>
			);

		case RefundPolicy.PlanYearlyBundle:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration and <refundsLink2>yearly plan refunds</refundsLink2> are limited to 14 days after purchase. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.'
						),
						{
							refundsLink,
							refundsLink2: <ExternalLink href={ REFUNDS } children={ undefined } />,
						}
					) }
				</Text>
			);

		case RefundPolicy.PlanBiennialBundle:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration and <refundsLink2>two year plan refunds</refundsLink2> are limited to 14 days after purchase. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.'
						),
						{
							refundsLink,
							refundsLink2: <ExternalLink href={ REFUNDS } children={ undefined } />,
						}
					) }
				</Text>
			);

		case RefundPolicy.PlanTriennialBundle:
			return (
				<Text>
					{ createInterpolateElement(
						__(
							'You understand that <refundsLink>domain name refunds</refundsLink> are limited to 96 hours after registration and <refundsLink2>three year plan refunds</refundsLink2> are limited to 14 days after purchase. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.'
						),
						{
							refundsLink,
							refundsLink2: <ExternalLink href={ REFUNDS } children={ undefined } />,
						}
					) }
				</Text>
			);
	}
}

function RefundPolicies( { cart }: { cart: ResponseCart } ) {
	const policies = getRefundPolicies( cart );
	return (
		<>
			{ policies.map( ( policy ) => (
				<RefundPolicyItem key={ policy } policy={ policy } cart={ cart } />
			) ) }
		</>
	);
}

// ---------------------------------------------------------------------------
// Domain registration agreements
// ---------------------------------------------------------------------------

interface DomainAgreement {
	name: string;
	url: string;
	domains: string[];
}

function getDomainRegistrationAgreements( cart: ResponseCart ): DomainAgreement[] {
	const domainProducts = cart.products.filter(
		( p ) => p.is_domain_registration || isDomainTransfer( p )
	);

	const agreementsByUrl: Record< string, DomainAgreement > = {};

	for ( const product of domainProducts ) {
		const legalAgreements = product.extra?.legal_agreements;

		if (
			legalAgreements &&
			! Array.isArray( legalAgreements ) &&
			Object.keys( legalAgreements ).length > 0
		) {
			for ( const [ url, name ] of Object.entries( legalAgreements ) ) {
				if ( agreementsByUrl[ url ] ) {
					agreementsByUrl[ url ].domains.push( product.meta );
				} else {
					agreementsByUrl[ url ] = { name: name as string, url, domains: [ product.meta ] };
				}
			}
		} else if ( product.extra?.domain_registration_agreement_url ) {
			const url = product.extra.domain_registration_agreement_url;
			if ( agreementsByUrl[ url ] ) {
				agreementsByUrl[ url ].domains.push( product.meta );
			} else {
				agreementsByUrl[ url ] = {
					name: __( 'Domain Registration Agreement' ),
					url,
					domains: [ product.meta ],
				};
			}
		}
	}

	return Object.values( agreementsByUrl );
}

function formatDomainList( domains: string[] ): string {
	if ( domains.length === 1 ) {
		return domains[ 0 ];
	}
	const last = domains[ domains.length - 1 ];
	const rest = domains.slice( 0, -1 );
	return `${ rest.join( ', ' ) } and ${ last }`;
}

function DomainRegistrationAgreements( { cart }: { cart: ResponseCart } ) {
	const agreements = getDomainRegistrationAgreements( cart );

	if ( agreements.length === 0 ) {
		return null;
	}

	if ( agreements.length === 1 ) {
		const agreement = agreements[ 0 ];
		return (
			<Text>
				{ createInterpolateElement(
					// translators: %(domainsList)s is a comma-separated list of domain names.
					__(
						'You agree to the <agreementLink>Domain Registration Agreement</agreementLink> for %(domainsList)s.'
					).replace( '%(domainsList)s', formatDomainList( agreement.domains ) ),
					{
						agreementLink: <ExternalLink href={ agreement.url } children={ undefined } />,
					}
				) }
			</Text>
		);
	}

	return (
		<>
			<Text>{ __( 'You agree to the following domain name registration legal agreements:' ) }</Text>
			{ agreements.map( ( agreement ) => (
				<Text key={ agreement.url }>
					{ createInterpolateElement(
						// translators: %(legalAgreementName)s is the name of the legal agreement, %(domainsList)s is a list of domain names.
						__(
							'View the <agreementLink>%(legalAgreementName)s</agreementLink> for %(domainsList)s.'
						)
							.replace( '%(legalAgreementName)s', agreement.name )
							.replace( '%(domainsList)s', formatDomainList( agreement.domains ) ),
						{
							agreementLink: <ExternalLink href={ agreement.url } children={ undefined } />,
						}
					) }
				</Text>
			) ) }
		</>
	);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Renders the regulatory and subscription information text shown above the
 * checkout submit button. Includes:
 *
 * - Terms of Service acceptance and renewal authorization
 * - Promotional period and billing schedule details (from cart.terms_of_service)
 * - Domain registration legal agreements
 * - Refund policies applicable to the items in the cart
 */
export function CheckoutTerms( { cart, siteSlug }: { cart: ResponseCart; siteSlug: string } ) {
	const isGiftPurchase = Boolean( cart.is_gift_purchase );
	const hasRenewable = hasRenewableSubscription( cart );

	return (
		<VStack
			spacing={ 2 }
			style={ { paddingBlock: '16px', fontSize: '0.875rem', color: '#646970' } }
		>
			<Text weight={ 600 }>{ __( 'By checking out:' ) }</Text>
			<TermsOfService hasRenewable={ hasRenewable } isGiftPurchase={ isGiftPurchase } />
			{ ! isGiftPurchase && <DomainRegistrationAgreements cart={ cart } /> }
			{ ! isGiftPurchase && <AdditionalTermsOfServiceInCart cart={ cart } siteSlug={ siteSlug } /> }
			<RefundPolicies cart={ cart } />
		</VStack>
	);
}
