import { formatCurrency } from '@automattic/number-formatters';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	isDIFMProduct,
	isGoogleWorkspace,
	isTitanMail,
	isTieredVolumeSpaceAddon,
	isJetpackSearch,
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

export function transactionIncludesTax( transaction: Receipt ) {
	if ( ! transaction || ! transaction.tax_integer ) {
		return false;
	}

	return transaction.items.some( ( item ) => item.tax_integer > 0 );
}

function renderTransactionQuantitySummaryForMailboxes(
	licensedQuantity: number,
	newQuantity: number,
	isRenewal: boolean,
	isUpgrade: boolean
) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %d: number of mailboxes */
			_n( 'Renewal for %d mailbox', 'Renewal for %d mailboxes', licensedQuantity ),
			licensedQuantity
		);
	}

	if ( isUpgrade ) {
		return sprintf(
			/* translators: %d: number of additional mailboxes */
			_n( 'Purchase of %d additional mailbox', 'Purchase of %d additional mailboxes', newQuantity ),
			newQuantity
		);
	}

	return sprintf(
		/* translators: %d: number of mailboxes */
		_n( 'Purchase of %d mailbox', 'Purchase of %d mailboxes', licensedQuantity ),
		licensedQuantity
	);
}

function renderDIFMTransactionQuantitySummary( licensedQuantity: number ) {
	return sprintf(
		/* translators: %d: number of pages */
		_n( 'One-time fee includes %d page', 'One-time fee includes %d pages', licensedQuantity ),
		licensedQuantity
	);
}

function renderJetpackSearchQuantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %d: number of search records/requests */
			__( 'Renewal for %d search records/requests' ),
			licensedQuantity
		);
	}

	return sprintf(
		/* translators: %d: number of search records/requests */
		__( 'Purchase for %d search records/requests' ),
		licensedQuantity
	);
}

function renderSpaceAddOnquantitySummary( licensedQuantity: number, isRenewal: boolean ) {
	if ( isRenewal ) {
		return sprintf(
			/* translators: %d: number of gigabytes */
			__( 'Renewal for %d GB' ),
			licensedQuantity
		);
	}

	return sprintf(
		/* translators: %d: number of gigabytes */
		__( 'Purchase of %d GB' ),
		licensedQuantity
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

	if ( isRenewal ) {
		return sprintf(
			/* translators: %d: number of items */
			_n( 'Renewal for %d item', 'Renewal for %d items', licensedQuantity ),
			licensedQuantity
		);
	}

	if ( isUpgrade ) {
		return sprintf(
			/* translators: %d: number of additional items */
			_n( 'Purchase of %d additional item', 'Purchase of %d additional items', newQuantity ),
			newQuantity
		);
	}

	return sprintf(
		/* translators: %d: number of items */
		_n( 'Purchase of %d item', 'Purchase of %d items', licensedQuantity ),
		licensedQuantity
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
		/* translators: 1: number of units, 2: formatted price per unit */
		_n( '%1$d unit @ %2$s', '%1$d units @ %2$s', numberOfUnits ),
		numberOfUnits,
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
		costOverrides?.some( ( costOverride ) => {
			! isOverrideCodeIntroductoryOffer( costOverride.override_code );
		} )
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
