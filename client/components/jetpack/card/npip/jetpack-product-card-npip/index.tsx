/**
 * External dependencies
 */
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { isNumber } from 'lodash';
import React, { createElement, ReactNode } from 'react';
import { Button, ProductIcon } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { preventWidows } from 'calypso/lib/formatting';
import JetpackProductCardTimeFrame from './time-frame';
import PlanPrice from 'calypso/my-sites/plan-price';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';
import InfoPopover from 'calypso/components/info-popover';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';
import type { Duration, PurchaseCallback } from 'calypso/my-sites/plans/jetpack-plans/types';

/**
 * Style dependencies
 */
import './style.scss';
import starIcon from './assets/star.svg';

type OwnProps = {
	iconSlug?: string;
	productSlug: string;
	productName: TranslateResult;
	headingLevel?: number;
	description?: ReactNode;
	currencyCode?: string | null;
	originalPrice: number;
	discountedPrice?: number;
	billingTerm: Duration;
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	onButtonClick: PurchaseCallback;
	expiryDate?: Moment;
	isFeatured?: boolean;
	isOwned?: boolean;
	isIncludedInPlan?: boolean;
	isDeprecated?: boolean;
	isAligned?: boolean;
	isDisabled?: boolean;
	disabledMessage?: TranslateResult | null;
	displayFrom?: boolean;
	tooltipText?: TranslateResult | ReactNode;
	aboveButtonText?: TranslateResult | ReactNode;
};

export type Props = OwnProps & Partial< FeaturesProps >;

const FRESHPACK_PERCENTAGE = 1 - 0.4; // 40% off

const DisplayPrice = ( {
	isOwned,
	isIncludedInPlan,
	isFree,
	discountedPrice,
	currencyCode,
	originalPrice,
	belowPriceText,
	displayFrom,
	expiryDate,
	billingTerm,
	tooltipText,
} ) => {
	const translate = useTranslate();

	if ( isOwned ) {
		return (
			<div className="jetpack-product-card-npip__price">
				<p className="jetpack-product-card-npip__you-own-this">
					<Gridicon
						className="jetpack-product-card-npip__you-own-this-icon"
						icon="checkmark-circle"
						size={ 48 }
					/>
					{ translate( 'You own this product' ) }
				</p>
			</div>
		);
	}

	if ( isIncludedInPlan ) {
		return (
			<div className="jetpack-product-card-npip__price">
				<p className="jetpack-product-card-npip__you-own-this">
					<Gridicon
						className="jetpack-product-card-npip__you-own-this-icon"
						icon="checkmark-circle"
						size={ 48 }
					/>
					{ translate( 'Part of your current plan' ) }
				</p>
			</div>
		);
	}

	if ( isFree ) {
		return (
			<div className="jetpack-product-card-npip__price">
				<div>
					<span className="jetpack-product-card-npip__price-free">{ translate( 'Free' ) }</span>
					{ belowPriceText && (
						<span className="jetpack-product-card-npip__billing-time-frame">
							{ belowPriceText }
						</span>
					) }
					<span className="jetpack-product-card-npip__get-started">
						{ translate( 'Get started for free' ) }
					</span>
				</div>
			</div>
		);
	}

	const couponOriginalPrice = discountedPrice ?? originalPrice;
	const couponDiscountedPrice = ( discountedPrice ?? originalPrice ) * FRESHPACK_PERCENTAGE;

	return (
		<div className="jetpack-product-card-npip__price">
			{ currencyCode && originalPrice ? (
				<>
					{ displayFrom && <span className="jetpack-product-card-npip__price-from">from</span> }
					<PlanPrice
						original
						className="jetpack-product-card-npip__original-price"
						rawPrice={ couponOriginalPrice as number }
						currencyCode={ currencyCode }
					/>
					<PlanPrice
						discounted
						rawPrice={ couponDiscountedPrice as number }
						currencyCode={ currencyCode }
					/>
					{ tooltipText && (
						<InfoPopover position="top" className="jetpack-product-card-npip__price-tooltip">
							{ tooltipText }
						</InfoPopover>
					) }
					<JetpackProductCardTimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
					<span className="jetpack-product-card-npip__you-save">
						{ translate( '* You Save %(percent)d%%', {
							args: { percent: 40 },
							comment: 'Asterisk clause describing the displayed price adjustment',
						} ) }
					</span>
				</>
			) : (
				<>
					<div className="jetpack-product-card-npip__price-placeholder" />
					<div className="jetpack-product-card-npip__time-frame-placeholder" />
				</>
			) }
		</div>
	);
};

const JetpackProductCardAlt2: React.FC< Props > = ( {
	iconSlug,
	productSlug,
	productName,
	headingLevel,
	description,
	currencyCode,
	originalPrice,
	discountedPrice,
	billingTerm,
	buttonLabel,
	buttonPrimary,
	onButtonClick,
	expiryDate,
	isFeatured,
	isOwned,
	isIncludedInPlan,
	isFree,
	isDeprecated,
	isAligned,
	features,
	isDisabled,
	disabledMessage,
	displayFrom,
	belowPriceText,
	tooltipText,
	aboveButtonText = null,
}: Props ) => {
	const translate = useTranslate();
	const parsedHeadingLevel = isNumber( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel ), 1 ), 6 )
		: 2;

	return (
		<div
			className={ classNames( 'jetpack-product-card-npip', {
				'is-disabled': isDisabled,
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-aligned': isAligned,
				'is-featured': isFeatured,
				'without-icon': ! iconSlug,
			} ) }
			data-e2e-product-slug={ productSlug }
		>
			{ isFeatured && (
				<div className="jetpack-product-card-npip__header">
					<img className="jetpack-product-card-npip__header-icon" src={ starIcon } alt="" />
					<span>{ translate( 'Recommended' ) }</span>
				</div>
			) }
			<div className="jetpack-product-card-npip__body">
				{ iconSlug && (
					<ProductIcon className="jetpack-product-card-npip__icon" slug={ iconSlug } />
				) }
				{ createElement(
					`h${ parsedHeadingLevel }`,
					{ className: 'jetpack-product-card-npip__product-name' },
					<>{ productName }</>
				) }

				<DisplayPrice
					isOwned={ isOwned }
					isIncludedInPlan={ isIncludedInPlan }
					isFree={ isFree }
					discountedPrice={ discountedPrice }
					currencyCode={ currencyCode }
					originalPrice={ originalPrice }
					displayFrom={ displayFrom }
					belowPriceText={ belowPriceText }
					expiryDate={ expiryDate }
					billingTerm={ billingTerm }
					tooltipText={ tooltipText }
				/>

				{ aboveButtonText && (
					<p className="jetpack-product-card-npip__above-button">{ aboveButtonText }</p>
				) }
				{ isDisabled && disabledMessage && (
					<p className="jetpack-product-card-npip__disabled-message">
						{ preventWidows( disabledMessage ) }
					</p>
				) }
				{ ! isDisabled && (
					<Button
						primary={ buttonPrimary }
						className="jetpack-product-card-npip__button"
						onClick={ onButtonClick }
						disabled={ isDisabled }
					>
						{ buttonLabel }
					</Button>
				) }

				<p className="jetpack-product-card-npip__description">{ description }</p>
				{ features && features.items.length > 0 && (
					<JetpackProductCardFeatures features={ features } />
				) }
			</div>
		</div>
	);
};

export default JetpackProductCardAlt2;
