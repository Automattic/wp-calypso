import { getCurrencyObject } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { Component, createElement } from 'react';
import { Badge } from '../';

import './style.scss';

export class PlanPrice extends Component< PlanPriceProps > {
	render() {
		const {
			currencyCode = 'USD',
			rawPrice,
			isSmallestUnit,
			original,
			discounted,
			className,
			displayFlatPrice,
			displayPerMonthNotation,
			productDisplayPrice,
			isOnSale,
			taxText,
			omitHeading,
			priceDisplayWrapperClassName,
			isLargeCurrency,
		} = this.props;

		const classes = clsx( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted,
			'is-large-currency': isLargeCurrency,
		} );

		const tagName = omitHeading ? 'span' : 'h4';

		const areThereMultipleRawPrices = rawPrice && Array.isArray( rawPrice ) && rawPrice.length > 1;

		if ( productDisplayPrice && ! areThereMultipleRawPrices ) {
			return createElement(
				tagName,
				{ className: classes },
				<span
					className="plan-price__integer"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
				/>
			);
		}

		if ( ! currencyCode || rawPrice === undefined || rawPrice === null ) {
			return null;
		}

		// "Normalize" the input price or price range.
		const rawPriceRange = Array.isArray( rawPrice ) ? rawPrice.slice( 0, 2 ) : [ rawPrice ];

		// If zero is in an array of length 2, render nothing
		if ( Array.isArray( rawPrice ) && rawPriceRange.includes( 0 ) ) {
			return null;
		}

		if ( displayFlatPrice ) {
			return (
				<FlatPriceDisplay
					smallerPrice={ rawPriceRange[ 0 ] }
					higherPrice={ rawPriceRange[ 1 ] }
					currencyCode={ currencyCode }
					className={ classes }
					isSmallestUnit={ isSmallestUnit }
				/>
			);
		}

		return (
			<MultiPriceDisplay
				className={ classes }
				tagName={ tagName }
				smallerPrice={ rawPriceRange[ 0 ] }
				higherPrice={ rawPriceRange[ 1 ] }
				currencyCode={ currencyCode }
				taxText={ taxText }
				displayPerMonthNotation={ displayPerMonthNotation }
				isOnSale={ isOnSale }
				priceDisplayWrapperClassName={ priceDisplayWrapperClassName }
				isSmallestUnit={ isSmallestUnit }
			/>
		);
	}
}

export default PlanPrice;

export interface PlanPriceProps {
	/**
	 * Can be either a floating point price to display, or a pair of floating
	 * point prices.
	 *
	 * If there are a pair of prices, they will be displayed as a range (eg:
	 * '$5-$10').
	 *
	 * If either of the numbers is a 0, nothing will be rendered at all.
	 *
	 * If specified along with `productDisplayPrice`, this will be ignored unless
	 * it is an array, in which case `productDisplayPrice` will be ignored.
	 */
	rawPrice?: number | [ number, number ] | null;

	/**
	 * If true, the number(s) in `rawPrice` will be interpreted as integers in
	 * the currency's smallest unit rather than floating point numbers.
	 *
	 * Has no effect if `productDisplayPrice` is being used.
	 */
	isSmallestUnit?: boolean;

	/**
	 * Adds the `is-original` CSS class.
	 */
	original?: boolean;

	/**
	 * Adds the `is-discounted` CSS class.
	 */
	discounted?: boolean;

	/**
	 * The currency code for the price.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 *
	 * Defaults to `USD` if not set or if undefined, but if it is `null`, the
	 * component will render nothing at all (if using `rawPrice`).
	 */
	currencyCode?: string | null;

	/**
	 * A string to add to the className of the component's output.
	 */
	className?: string;

	/**
	 * Displays a "Sale" banner over the price if set.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	isOnSale?: boolean;

	/**
	 * Text to display adjacent to the price referring to taxes.
	 *
	 * It is rendered inside the string '(+X tax)' where `X` is this prop.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	taxText?: string;

	/**
	 * Whether to display a "per month" label adjacent to the price.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	displayPerMonthNotation?: boolean;

	/**
	 * A pre-formatted price to display.
	 *
	 * Ignored if `rawPrice` is set and is an array.
	 */
	productDisplayPrice?: string | TranslateResult;

	/**
	 * If set, the component will render a `span` instead of an `h4`.
	 */
	omitHeading?: boolean;

	/**
	 * If set, the component will render without separating the integer part of
	 * the price from the decimal part of the price.
	 *
	 * If set, many of the other formatting options will be ignored.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 */
	displayFlatPrice?: boolean;

	/**
	 * If set, this renders each price inside a `div` with the class passed,
	 * but is otherwise identical to the output normally used by `rawPrice`.
	 *
	 * Ignored if `displayFlatPrice` is set.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 */
	priceDisplayWrapperClassName?: string;

	/**
	 * If true, this renders the price with a smaller font size by adding the `is-large-currency` class.
	 */
	isLargeCurrency?: boolean;
}

function PriceWithoutHtml( {
	price,
	currencyCode,
	isSmallestUnit,
}: {
	price: number;
	currencyCode: string;
	isSmallestUnit?: boolean;
} ) {
	const priceObj = getCurrencyObject( price, currencyCode, { isSmallestUnit } );
	if ( priceObj.hasNonZeroFraction ) {
		return <>{ `${ priceObj.integer }${ priceObj.fraction }` }</>;
	}
	return <>{ priceObj.integer }</>;
}

function FlatPriceDisplay( {
	smallerPrice,
	higherPrice,
	currencyCode,
	className,
	isSmallestUnit,
}: {
	smallerPrice: number;
	higherPrice?: number;
	currencyCode: string;
	className?: string;
	isSmallestUnit?: boolean;
} ) {
	const { symbol: currencySymbol, symbolPosition } = getCurrencyObject(
		smallerPrice,
		currencyCode
	);
	const translate = useTranslate();

	if ( ! higherPrice ) {
		return (
			<span className={ className }>
				{ symbolPosition === 'before' ? currencySymbol : null }
				<PriceWithoutHtml
					price={ smallerPrice }
					currencyCode={ currencyCode }
					isSmallestUnit={ isSmallestUnit }
				/>
				{ symbolPosition === 'after' ? currencySymbol : null }
			</span>
		);
	}

	return (
		<span className={ className }>
			{ symbolPosition === 'before' ? currencySymbol : null }
			{ translate( '%(smallerPrice)s-%(higherPrice)s', {
				args: {
					smallerPrice: (
						<PriceWithoutHtml
							price={ smallerPrice }
							currencyCode={ currencyCode }
							isSmallestUnit={ isSmallestUnit }
						/>
					),
					higherPrice: (
						<PriceWithoutHtml
							price={ higherPrice }
							currencyCode={ currencyCode }
							isSmallestUnit={ isSmallestUnit }
						/>
					),
				},
				comment: 'The price range for a particular product',
			} ) }
			{ symbolPosition === 'after' ? currencySymbol : null }
		</span>
	);
}

function MultiPriceDisplay( {
	tagName,
	className,
	smallerPrice,
	higherPrice,
	currencyCode,
	taxText,
	displayPerMonthNotation,
	isOnSale,
	priceDisplayWrapperClassName,
	isSmallestUnit,
}: {
	tagName: 'h4' | 'span';
	className?: string;
	smallerPrice: number;
	higherPrice?: number;
	currencyCode: string;
	taxText?: string;
	displayPerMonthNotation?: boolean;
	isOnSale?: boolean;
	priceDisplayWrapperClassName?: string;
	isSmallestUnit?: boolean;
} ) {
	const { symbol: currencySymbol, symbolPosition } = getCurrencyObject(
		smallerPrice,
		currencyCode
	);
	const translate = useTranslate();

	return createElement(
		tagName,
		{ className },
		<>
			{ symbolPosition === 'before' ? (
				<sup className="plan-price__currency-symbol">{ currencySymbol }</sup>
			) : null }

			{ ! higherPrice && (
				<HtmlPriceDisplay
					price={ smallerPrice }
					currencyCode={ currencyCode }
					priceDisplayWrapperClassName={ priceDisplayWrapperClassName }
					isSmallestUnit={ isSmallestUnit }
				/>
			) }
			{ higherPrice &&
				translate( '{{smallerPrice/}}-{{higherPrice/}}', {
					components: {
						smallerPrice: (
							<HtmlPriceDisplay
								price={ smallerPrice }
								currencyCode={ currencyCode }
								priceDisplayWrapperClassName={ priceDisplayWrapperClassName }
								isSmallestUnit={ isSmallestUnit }
							/>
						),
						higherPrice: (
							<HtmlPriceDisplay
								price={ higherPrice }
								currencyCode={ currencyCode }
								priceDisplayWrapperClassName={ priceDisplayWrapperClassName }
								isSmallestUnit={ isSmallestUnit }
							/>
						),
					},
					comment: 'The price range for a particular product',
				} ) }

			{ symbolPosition === 'after' ? (
				<sup className="plan-price__currency-symbol">{ currencySymbol }</sup>
			) : null }

			{ taxText && (
				<sup className="plan-price__tax-amount">
					{ translate( '(+%(taxText)s tax)', { args: { taxText } } ) }
				</sup>
			) }
			{ displayPerMonthNotation && (
				<span className="plan-price__term">
					{ translate( 'per{{newline/}}month', {
						components: { newline: <br /> },
						comment:
							'Displays next to the price. You can remove the "{{newline/}}" if it is not proper for your language.',
					} ) }
				</span>
			) }
			{ isOnSale && (
				<Badge>
					{ translate( 'Sale', {
						comment: 'Shown next to a domain that has a special discounted sale price',
					} ) }
				</Badge>
			) }
		</>
	);
}

function HtmlPriceDisplay( {
	price,
	currencyCode,
	priceDisplayWrapperClassName,
	isSmallestUnit,
}: {
	price: number;
	currencyCode: string;
	priceDisplayWrapperClassName?: string;
	isSmallestUnit?: boolean;
} ) {
	const priceObj = getCurrencyObject( price, currencyCode, { isSmallestUnit } );

	if ( priceDisplayWrapperClassName ) {
		return (
			<div className={ priceDisplayWrapperClassName }>
				<span className="plan-price__integer">
					{ priceObj.integer }
					{ priceObj.hasNonZeroFraction && priceObj.fraction }
				</span>
			</div>
		);
	}

	return (
		<>
			<span className="plan-price__integer">{ priceObj.integer }</span>
			<sup className="plan-price__fraction">
				{ priceObj.hasNonZeroFraction && priceObj.fraction }
			</sup>
		</>
	);
}
