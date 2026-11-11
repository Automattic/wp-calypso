import { AI_CREDITS_PRODUCTS } from '@automattic/api-core';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { __, _n, sprintf } from '@wordpress/i18n';
import { isAkismetPro500Plan } from '../../utils/akismet';
import {
	isDIFMProduct,
	isGoogleWorkspace,
	isTitanMail,
	isTieredVolumeSpaceAddon,
	isJetpackSearch,
	isJetpackStatsPaidProductSlug,
} from '../../utils/purchase';
import type { Receipt, ReceiptItem } from '@automattic/api-core';
import type { IntroductoryOfferTerms } from '@automattic/shopping-cart';

interface GroupedDomainProduct {
	product: ReceiptItem;
	groupCount: number;
}

export const groupDomainProducts = ( originalItems: ReceiptItem[] ) => {
	const domainProducts: ReceiptItem[] = [];
	const otherProducts: ReceiptItem[] = [];
	originalItems.forEach( ( item ) => {
		if ( item.product_slug === 'wp-domains' ) {
			domainProducts.push( item );
		} else {
			otherProducts.push( item );
		}
	} );

	const groupedDomainProductsMap = domainProducts.reduce<
		Map< ReceiptItem[ 'domain' ], GroupedDomainProduct >
	>( ( groups, product ) => {
		const existingGroup = groups.get( product.domain );
		if ( existingGroup ) {
			existingGroup.product.amount_integer += product.amount_integer;
			existingGroup.product.subtotal_integer += product.subtotal_integer;
			existingGroup.product.tax_integer += product.tax_integer;
			existingGroup.groupCount++;
		} else {
			const newGroup = {
				product: { ...product },
				groupCount: 1,
			};
			groups.set( product.domain, newGroup );
		}

		return groups;
	}, new Map() );

	const groupedDomainProducts: ReceiptItem[] = [];

	groupedDomainProductsMap.forEach( ( value ) => {
		if ( value.groupCount === 1 ) {
			groupedDomainProducts.push( value.product );
			return;
		}
		groupedDomainProducts.push( {
			...value.product,
			variation: __( 'Domain Registration' ),
		} );
	} );

	return [ ...otherProducts, ...groupedDomainProducts ];
};

interface SummarizedReceiptItems {
	groupedItems: ReceiptItem[];
	label: string;
}

export function summarizeReceiptItems( originalItems: ReceiptItem[] ): SummarizedReceiptItems {
	const groupedItems = groupDomainProducts( originalItems );

	let label = '';
	if ( groupedItems.length > 0 ) {
		label = groupedItems.length > 1 ? __( 'Multiple items' ) : groupedItems[ 0 ].variation;
	}

	return { groupedItems, label };
}

export function transactionIncludesTax( transaction: Receipt ) {
	if ( ! transaction || ! transaction.tax_integer ) {
		return false;
	}

	return transaction.items.some( ( item ) => item.tax_integer > 0 );
}

export function formatReceiptAmount( receipt: Receipt ): string {
	return formatCurrency( receipt.amount_integer, receipt.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
}

export function formatReceiptTaxAmount( receipt: Receipt ): string {
	return formatCurrency( receipt.tax_integer, receipt.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
}

function renderTransactionQuantitySummaryForMailboxes(
	licensedQuantity: number,
	newQuantity: number,
	isRenewal: boolean,
	isUpgrade: boolean
) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of mailboxes */
			_n( 'Renewal for %s mailbox', 'Renewal for %s mailboxes', licensedQuantity ),
			formatNumber( licensedQuantity )
		);
	}

	if ( isUpgrade ) {
		return sprintf(
			/* translators: %s: formatted number of additional mailboxes */
			_n( 'Purchase of %s additional mailbox', 'Purchase of %s additional mailboxes', newQuantity ),
			formatNumber( newQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of mailboxes */
		_n( 'Purchase of %s mailbox', 'Purchase of %s mailboxes', licensedQuantity ),
		formatNumber( licensedQuantity )
	);
}

function renderDIFMTransactionQuantitySummary( licensedQuantity: number ) {
	return sprintf(
		/* translators: %s: formatted number of pages */
		_n( 'One-time fee includes %s page', 'One-time fee includes %s pages', licensedQuantity ),
		formatNumber( licensedQuantity )
	);
}

function renderJetpackSearchQuantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of search records/requests */
			__( 'Renewal for %s search records/requests' ),
			formatNumber( licensedQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of search records/requests */
		__( 'Purchase for %s search records/requests' ),
		formatNumber( licensedQuantity )
	);
}

function renderJetpackStatsQuantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of views per month */
			__( 'Renewal for %s views per month' ),
			formatNumber( licensedQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of views per month */
		__( 'Purchase for %s views per month' ),
		formatNumber( licensedQuantity )
	);
}

function renderSpaceAddOnquantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of gigabytes */
			__( 'Renewal for %s GB' ),
			formatNumber( licensedQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of gigabytes */
		__( 'Purchase of %s GB' ),
		formatNumber( licensedQuantity )
	);
}

function renderAiCreditsQuantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of AI credits */
			_n( 'Renewal for %s AI credit', 'Renewal for %s AI credits', licensedQuantity ),
			formatNumber( licensedQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of AI credits */
		_n( 'Purchase of %s AI credit', 'Purchase of %s AI credits', licensedQuantity ),
		formatNumber( licensedQuantity )
	);
}

function renderAkismetTransactionQuantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of 500 API call licenses */
			_n(
				'Renewal for %s 500 API call license',
				'Renewal for %s 500 API call licenses',
				licensedQuantity
			),
			formatNumber( licensedQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of 500 API call licenses */
		_n(
			'Purchase of %s 500 API call license',
			'Purchase of %s 500 API call licenses',
			licensedQuantity
		),
		formatNumber( licensedQuantity )
	);
}

export function DomainTransactionVolumeSummary( { item }: { item: ReceiptItem } ) {
	if ( ! item.volume ) {
		return null;
	}

	const isRenewal = 'recurring' === item.type;
	const volume = parseInt( String( item.volume ) );

	if ( 'wp-domains' !== item.product_slug || item.variation_slug === 'wp-domain-mapping' ) {
		return null;
	}

	if ( isRenewal ) {
		return (
			<em>
				{ sprintf(
					/* translators: %d: number of years */
					_n( 'Domain renewed for %d year', 'Domain renewed for %d years', volume ),
					volume
				) }
			</em>
		);
	}

	return (
		<em>
			{ sprintf(
				/* translators: %d: number of years */
				_n( 'Domain registered for %d year', 'Domain registered for %d years', volume ),
				volume
			) }
		</em>
	);
}

export function renderTransactionQuantitySummary( {
	licensed_quantity,
	new_quantity,
	type,
	wpcom_product_slug,
}: ReceiptItem ) {
	if ( ! licensed_quantity ) {
		return null;
	}

	const licensedQuantity = parseInt( String( licensed_quantity ) );
	const newQuantity = parseInt( String( new_quantity ) );
	const product = { product_slug: wpcom_product_slug };
	const isRenewal = 'recurring' === type;
	const isUpgrade = 'new purchase' === type && newQuantity > 0;

	if ( isJetpackSearch( product ) ) {
		return renderJetpackSearchQuantitySummary( licensedQuantity, isRenewal );
	}

	if ( isJetpackStatsPaidProductSlug( wpcom_product_slug ) ) {
		return renderJetpackStatsQuantitySummary( licensedQuantity, isRenewal );
	}

	if ( isGoogleWorkspace( product ) || isTitanMail( product ) ) {
		return renderTransactionQuantitySummaryForMailboxes(
			licensedQuantity,
			newQuantity,
			isRenewal,
			isUpgrade
		);
	}

	if ( isDIFMProduct( product ) ) {
		return renderDIFMTransactionQuantitySummary( licensedQuantity );
	}

	if ( isTieredVolumeSpaceAddon( product ) ) {
		return renderSpaceAddOnquantitySummary( licensedQuantity, isRenewal );
	}

	if ( isAkismetPro500Plan( wpcom_product_slug ) ) {
		return renderAkismetTransactionQuantitySummary( licensedQuantity, isRenewal );
	}

	if ( AI_CREDITS_PRODUCTS.includes( wpcom_product_slug ) ) {
		return renderAiCreditsQuantitySummary( licensedQuantity, isRenewal );
	}

	if ( isRenewal ) {
		return sprintf(
			/* translators: %s: formatted number of items */
			_n( 'Renewal for %s item', 'Renewal for %s items', licensedQuantity ),
			formatNumber( licensedQuantity )
		);
	}

	if ( isUpgrade ) {
		return sprintf(
			/* translators: %s: formatted number of additional items */
			_n( 'Purchase of %s additional item', 'Purchase of %s additional items', newQuantity ),
			formatNumber( newQuantity )
		);
	}

	return sprintf(
		/* translators: %s: formatted number of items */
		_n( 'Purchase of %s item', 'Purchase of %s items', licensedQuantity ),
		formatNumber( licensedQuantity )
	);
}

export function getTransactionTermLabel( transaction: ReceiptItem ) {
	switch ( transaction.months_per_renewal_interval ) {
		case 1:
			return __( 'Monthly subscription' );
		case 12:
			return __( 'Annual subscription' );
		case 24:
			return __( 'Two year subscription' );
		case 36:
			return __( 'Three year subscription' );
		case 100:
			return __( 'Hundred year subscription' );
		default:
			return undefined;
	}
}

export function isTransactionJetpackSearch10kTier( {
	wpcom_product_slug,
	licensed_quantity,
	price_tier_slug,
}: ReceiptItem ): boolean {
	const product = { product_slug: wpcom_product_slug };
	return (
		isJetpackSearch( product ) &&
		licensed_quantity !== null &&
		price_tier_slug === 'additional_10k_queries_and_records'
	);
}

export function renderJetpackSearch10kTierBreakdown(
	{ licensed_quantity, currency }: ReceiptItem,
	subtotalInteger: number
) {
	if ( ! licensed_quantity ) {
		return null;
	}

	const numberOfUnits = Math.ceil( licensed_quantity / 10000 );
	const pricePerUnit = subtotalInteger / numberOfUnits;
	const formattedPricePerUnit = formatCurrency( pricePerUnit, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	return sprintf(
		/* translators: 1: formatted number of units, 2: formatted price per unit */
		_n( '%1$s unit @ %2$s', '%1$s units @ %2$s', numberOfUnits ),
		formatNumber( numberOfUnits ),
		formattedPricePerUnit
	);
}

/**
 * Returns the bill period in months for an introductory offer interval unit.
 */
function getBillPeriodMonthsForIntroductoryOfferInterval( interval: string ): number {
	switch ( interval ) {
		case 'month':
			return 1;
		case 'year':
			return 12;
		default:
			return 0;
	}
}

/**
 * Returns true if the product has an introductory offer which is for a
 * different term length than the term length of the product (eg: a 3 month
 * discount for an annual plan).
 */
export function doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
	costOverrides: { override_code: string }[] | undefined,
	introductoryOfferTerms: IntroductoryOfferTerms | undefined | null,
	monthsPerBillPeriodForProduct: number | undefined | null
): boolean {
	if (
		costOverrides?.some(
			( costOverride ) => ! isOverrideCodeIntroductoryOffer( costOverride.override_code )
		)
	) {
		return false;
	}
	if ( ! introductoryOfferTerms?.enabled ) {
		return false;
	}
	if (
		getBillPeriodMonthsForIntroductoryOfferInterval( introductoryOfferTerms.interval_unit ) ===
		monthsPerBillPeriodForProduct
	) {
		return false;
	}
	return true;
}

/**
 * Checks if an override code represents an introductory offer.
 */
function isOverrideCodeIntroductoryOffer( overrideCode: string ): boolean {
	switch ( overrideCode ) {
		case 'introductory-offer':
			return true;
		case 'prorated-introductory-offer':
			return true;
		case 'quantity-upgrade-introductory-offer':
			return true;
	}
	return false;
}
