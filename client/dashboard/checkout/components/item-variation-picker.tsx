import { formatCurrency } from '@automattic/number-formatters';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import type {
	ResponseCartProduct,
	ResponseCartProductVariant,
	ReplaceProductInCart,
} from '@automattic/shopping-cart';

import './item-variation-picker.scss';

/**
 * Returns a human-readable label for a billing term given its length in months.
 */
function getTermLabel( billPeriodInMonths: number ): string {
	switch ( billPeriodInMonths ) {
		case 1:
			return __( 'One month' );
		case 12:
			return __( 'One year' );
		case 24:
			return __( 'Two years' );
		case 36:
			return __( 'Three years' );
		case 48:
			return __( 'Four years' );
		case 60:
			return __( 'Five years' );
	}
	if ( billPeriodInMonths % 12 === 0 ) {
		const years = billPeriodInMonths / 12;
		// translators: %d is the number of years
		return __( '%d years' ).replace( '%d', String( years ) );
	}
	// translators: %d is the number of months
	return __( '%d months' ).replace( '%d', String( billPeriodInMonths ) );
}

/**
 * Computes the savings percentage for a variant compared to the shortest-term
 * (baseline) variant. Returns 0 when there is no meaningful saving to display.
 */
function getSavingsPercent(
	variant: ResponseCartProductVariant,
	compareTo: ResponseCartProductVariant
): number {
	if ( variant.product_slug === compareTo.product_slug ) {
		return 0;
	}
	// Only show savings when the variant is longer than the baseline.
	if ( compareTo.bill_period_in_months >= variant.bill_period_in_months ) {
		return 0;
	}
	const compareToScaled =
		( compareTo.price_integer / compareTo.bill_period_in_months ) * variant.bill_period_in_months;
	if ( compareToScaled <= 0 ) {
		return 0;
	}
	const percent = Math.round( 100 - ( variant.price_integer / compareToScaled ) * 100 );
	// Ignore rounding artefacts that don't amount to a full percentage point.
	return percent > 0 ? percent : 0;
}

function isDomainProduct( product: ResponseCartProduct ): boolean {
	return !! product.is_domain_registration || product.product_slug === 'domain_transfer';
}

/**
 * Unique key for a variant. Domain registration variants share the same
 * product_id and product_slug — they're differentiated by volume (years).
 */
function getVariantKey( variant: ResponseCartProductVariant, variantsHaveVolume: boolean ): string {
	return variantsHaveVolume ? String( variant.volume ?? 1 ) : String( variant.product_id );
}

interface ItemVariationPickerProps {
	product: ResponseCartProduct;
	replaceProductInCart: ReplaceProductInCart;
}

/**
 * Dropdown picker for domain registration periods. Domain variants share the
 * same product_id and slug, differentiated only by volume (number of years).
 */
function DomainVariationPicker( {
	product,
	variants,
	replaceProductInCart,
}: ItemVariationPickerProps & { variants: ResponseCartProductVariant[] } ) {
	const variantsHaveVolume = variants.some( ( v ) => v.volume !== undefined );

	const currentKey =
		variantsHaveVolume && product.volume !== undefined
			? String( product.volume )
			: String( product.product_id );

	const [ optimisticKey, setOptimisticKey ] = useState( currentKey );

	useEffect( () => {
		setOptimisticKey( currentKey );
	}, [ currentKey ] );

	const options = variants.map( ( variant ) => ( {
		label:
			getTermLabel( variant.bill_period_in_months ) +
			' — ' +
			formatCurrency( variant.price_integer, variant.currency, {
				isSmallestUnit: true,
				stripZeros: true,
			} ),
		value: getVariantKey( variant, variantsHaveVolume ),
	} ) );

	return (
		<div className="item-variation-picker--domain">
			<SelectControl
				label={ __( 'Registration period' ) }
				value={ optimisticKey }
				options={ options }
				onChange={ ( value ) => {
					const selected = variants.find(
						( v ) => getVariantKey( v, variantsHaveVolume ) === value
					);
					if ( selected ) {
						setOptimisticKey( value );
						void replaceProductInCart( product.uuid, {
							product_slug: selected.product_slug,
							product_id: selected.product_id,
							...( selected.volume !== undefined && { volume: selected.volume } ),
						} );
					}
				} }
			/>
		</div>
	);
}

/**
 * Variant picker that lets the user switch between billing term options for a
 * cart product. Renders radio buttons for plans and a dropdown for domains.
 */
export function ItemVariationPicker( { product, replaceProductInCart }: ItemVariationPickerProps ) {
	// Optimistic slug so the radio UI responds instantly before the cart reloads.
	const [ optimisticSlug, setOptimisticSlug ] = useState( product.product_slug );

	useEffect( () => {
		setOptimisticSlug( product.product_slug );
	}, [ product.product_slug ] );

	const variants = [ ...( product.product_variants ?? [] ) ].sort(
		( a, b ) => a.bill_period_in_months - b.bill_period_in_months
	);

	if ( variants.length < 2 ) {
		return null;
	}

	if ( isDomainProduct( product ) ) {
		return (
			<DomainVariationPicker
				product={ product }
				variants={ variants }
				replaceProductInCart={ replaceProductInCart }
			/>
		);
	}

	// The shortest billing term is the baseline for savings comparisons.
	const compareTo = variants[ 0 ];

	return (
		<ul
			className="item-variation-picker"
			role="radiogroup"
			aria-label={ __( 'Pick a billing term' ) }
		>
			{ variants.map( ( variant ) => {
				const isSelected = variant.product_slug === optimisticSlug;
				const savingsPercent = getSavingsPercent( variant, compareTo );
				const pricePerMonth = Math.round( variant.price_integer / variant.bill_period_in_months );
				// translators: %d is the savings percentage (e.g. "Save 19%")
				const savingsText = __( 'Save %d%%' ).replace( '%d', String( savingsPercent ) );
				const savingsLabel = savingsPercent > 0 ? savingsText : '';

				return (
					<li key={ variant.product_slug } className="item-variation-picker__item">
						{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
						<label
							className={ clsx( 'item-variation-picker__option', {
								'is-selected': isSelected,
							} ) }
							htmlFor={ `variant-${ product.uuid }-${ variant.product_slug }` }
						>
							<input
								type="radio"
								id={ `variant-${ product.uuid }-${ variant.product_slug }` }
								name={ `variant-${ product.uuid }` }
								value={ variant.product_slug }
								checked={ isSelected }
								className="item-variation-picker__radio"
								onChange={ () => {
									setOptimisticSlug( variant.product_slug );
									void replaceProductInCart( product.uuid, {
										product_slug: variant.product_slug,
										product_id: variant.product_id,
									} );
								} }
							/>
							<span className="item-variation-picker__term">
								{ getTermLabel( variant.bill_period_in_months ) }
							</span>
							<span className="item-variation-picker__price-area">
								<span className="item-variation-picker__price">
									{ formatCurrency( pricePerMonth, variant.currency, {
										isSmallestUnit: true,
										stripZeros: true,
									} ) }
									{ ' /mo' }
								</span>
								{ savingsPercent > 0 && (
									<span className="item-variation-picker__savings">{ savingsLabel }</span>
								) }
							</span>
						</label>
					</li>
				);
			} ) }
		</ul>
	);
}
