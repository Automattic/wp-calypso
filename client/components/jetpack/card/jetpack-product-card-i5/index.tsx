/**
 * External dependencies
 */
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { isFinite, isNumber } from 'lodash';
import React, { createElement, ReactNode } from 'react';
import { Button, ProductIcon } from '@automattic/components';

/**
 * Internal dependencies
 */
import JetpackProductCardTimeFrame from './time-frame';
import { preventWidows } from 'calypso/lib/formatting';
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
	currencyCode: string | null;
	originalPrice: number;
	discountedPrice?: number;
	billingTerm: Duration;
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	onButtonClick: PurchaseCallback;
	expiryDate?: Moment;
	isFeatured?: boolean;
	isOwned?: boolean;
	isDeprecated?: boolean;
	isAligned?: boolean;
	displayFrom?: boolean;
	tooltipText?: TranslateResult | ReactNode;
};

export type Props = OwnProps & Partial< FeaturesProps >;

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
	isDeprecated,
	isAligned,
	features,
	displayFrom,
	tooltipText,
}: Props ) => {
	const translate = useTranslate();
	const isDiscounted = isFinite( discountedPrice );
	const parsedHeadingLevel = isNumber( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel ), 1 ), 6 )
		: 2;

	return (
		<div
			className={ classNames( 'jetpack-product-card-i5', {
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-aligned': isAligned,
				'is-featured': isFeatured,
				'without-icon': ! iconSlug,
			} ) }
			data-e2e-product-slug={ productSlug }
		>
			{ isFeatured && (
				<div className="jetpack-product-card-i5__header">
					<img className="jetpack-product-card-i5__header-icon" src={ starIcon } alt="" />
					<span>{ translate( 'Recommended' ) }</span>
				</div>
			) }
			<div className="jetpack-product-card-i5__body">
				{ iconSlug && <ProductIcon className="jetpack-product-card-i5__icon" slug={ iconSlug } /> }
				{ createElement(
					`h${ parsedHeadingLevel }`,
					{ className: 'jetpack-product-card-i5__product-name' },
					<>{ preventWidows( productName ) }</>
				) }
				<p className="jetpack-product-card-i5__description">{ description }</p>
				<div className="jetpack-product-card-i5__price">
					{ currencyCode && originalPrice ? (
						<>
							{ displayFrom && <span className="jetpack-product-card-i5__price-from">from</span> }
							<span className="jetpack-product-card-i5__raw-price">
								<PlanPrice
									rawPrice={ ( isDiscounted ? discountedPrice : originalPrice ) as number }
									currencyCode={ currencyCode }
								/>
							</span>
							<JetpackProductCardTimeFrame expiryDate={ expiryDate } billingTerm={ billingTerm } />
							{ tooltipText && (
								<InfoPopover position="top" className="jetpack-product-card-i5__price-tooltip">
									{ tooltipText }
								</InfoPopover>
							) }
						</>
					) : (
						<>
							<div className="jetpack-product-card-i5__price-placeholder" />
							<div className="jetpack-product-card-i5__time-frame-placeholder" />
						</>
					) }
				</div>
				<Button
					primary={ buttonPrimary }
					className="jetpack-product-card-i5__button"
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
				{ features && features.items.length > 0 && (
					<JetpackProductCardFeatures features={ features } />
				) }
			</div>
		</div>
	);
};

export default JetpackProductCardAlt2;
