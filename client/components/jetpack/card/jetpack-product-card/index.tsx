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
import JetpackProductCardTimeFrame from './time-frame';
import PlanPrice from 'calypso/my-sites/plan-price';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';

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

const DisplayPrice = ( {
	isOwned,
	isIncludedInPlan,
	isFree,
	discountedPrice,
	currencyCode,
	originalPrice,
	displayFrom,
	expiryDate,
	billingTerm,
	tooltipText,
} ) => {
	const translate = useTranslate();

	if ( isOwned ) {
		return (
			<p className="jetpack-product-card__you-own-this">{ translate( 'You own this product' ) }</p>
		);
	}

	if ( isIncludedInPlan ) {
		return (
			<p className="jetpack-product-card__you-own-this">
				{ translate( 'Part of your current plan' ) }
			</p>
		);
	}

	if ( isFree ) {
		return (
			<div className="jetpack-product-card__price">
				<span className="jetpack-product-card__price-free">{ translate( 'Free' ) }</span>
			</div>
		);
	}

	const isDiscounted = Number.isFinite( discountedPrice );

	return (
		<div className="jetpack-product-card__price">
			{ currencyCode && originalPrice ? (
				<>
					{ displayFrom && <span className="jetpack-product-card__price-from">from</span> }
					<span className="jetpack-product-card__raw-price">
						<PlanPrice
							rawPrice={ ( isDiscounted ? discountedPrice : originalPrice ) as number }
							currencyCode={ currencyCode }
						/>
					</span>
					<JetpackProductCardTimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
					{ tooltipText && (
						<InfoPopover position="top" className="jetpack-product-card__price-tooltip">
							{ tooltipText }
						</InfoPopover>
					) }
				</>
			) : (
				<>
					<div className="jetpack-product-card__price-placeholder" />
					<div className="jetpack-product-card__time-frame-placeholder" />
				</>
			) }
		</div>
	);
};

const JetpackProductCard: React.FC< Props > = ( {
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
	tooltipText,
	aboveButtonText = null,
}: Props ) => {
	const translate = useTranslate();
	const parsedHeadingLevel = isNumber( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel ), 1 ), 6 )
		: 2;

	return (
		<div
			className={ classNames( 'jetpack-product-card', {
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
				<div className="jetpack-product-card__header">
					<img className="jetpack-product-card__header-icon" src={ starIcon } alt="" />
					<span>{ translate( 'Recommended' ) }</span>
				</div>
			) }
			<div className="jetpack-product-card__body">
				{ iconSlug && <ProductIcon className="jetpack-product-card__icon" slug={ iconSlug } /> }
				{ createElement(
					`h${ parsedHeadingLevel }`,
					{ className: 'jetpack-product-card__product-name' },
					<>{ productName }</>
				) }
				<p className="jetpack-product-card__description">{ description }</p>
				<DisplayPrice
					isOwned={ isOwned }
					isIncludedInPlan={ isIncludedInPlan }
					isFree={ isFree }
					discountedPrice={ discountedPrice }
					currencyCode={ currencyCode }
					originalPrice={ originalPrice }
					displayFrom={ displayFrom }
					expiryDate={ expiryDate }
					billingTerm={ billingTerm }
					tooltipText={ tooltipText }
				/>
				{ aboveButtonText && (
					<p className="jetpack-product-card__above-button">{ aboveButtonText }</p>
				) }
				{ isDisabled && disabledMessage && (
					<p className="jetpack-product-card__disabled-message">
						{ preventWidows( disabledMessage ) }
					</p>
				) }
				{ ! isDisabled && (
					<Button
						primary={ buttonPrimary }
						className="jetpack-product-card__button"
						onClick={ onButtonClick }
						disabled={ isDisabled }
					>
						{ buttonLabel }
					</Button>
				) }
				{ features && features.items.length > 0 && (
					<JetpackProductCardFeatures features={ features } />
				) }
			</div>
		</div>
	);
};

export default JetpackProductCard;
