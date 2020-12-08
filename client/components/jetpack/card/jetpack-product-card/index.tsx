/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { isFinite, isNumber } from 'lodash';
import React, { createElement, useRef, FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { Button, ProductIcon } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { preventWidows } from 'calypso/lib/formatting';
import PlanPrice from 'calypso/my-sites/plan-price';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';
import useFlexboxWrapDetection from './lib/use-flexbox-wrap-detection';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';

/**
 * Style dependencies
 */
import './style.scss';

type OwnProps = {
	className?: string;
	iconSlug: string;
	productName: TranslateResult;
	productType?: string;
	headingLevel?: number;
	subheadline?: TranslateResult;
	description?: ReactNode;
	currencyCode: string | null;
	originalPrice: number;
	discountedPrice?: number;
	withStartingPrice?: boolean;
	billingTimeFrame: TranslateResult;
	badgeLabel?: TranslateResult;
	discountMessage?: TranslateResult;
	buttonLabel: TranslateResult;
	onButtonClick: () => void;
	cancelLabel?: TranslateResult;
	onCancelClick?: () => void;
	children?: ReactNode;
	isHighlighted?: boolean;
	isOwned?: boolean;
	isDeprecated?: boolean;
	expiryDate?: Moment;
	UpgradeNudge?: ReactNode;
	hidePrice?: boolean;
};

export type Props = OwnProps & Partial< FeaturesProps >;

const JetpackProductCard: FunctionComponent< Props > = ( {
	className,
	iconSlug,
	productName,
	productType,
	headingLevel,
	subheadline,
	description,
	currencyCode,
	originalPrice,
	discountedPrice,
	withStartingPrice,
	billingTimeFrame,
	badgeLabel,
	discountMessage,
	buttonLabel,
	onButtonClick,
	cancelLabel,
	onCancelClick,
	children,
	isHighlighted,
	isOwned,
	isDeprecated,
	expiryDate,
	features,
	isExpanded,
	UpgradeNudge,
	hidePrice,
	productSlug,
} ) => {
	const translate = useTranslate();
	const priceEl = useRef( null );
	const isHeaderWrapped = useFlexboxWrapDetection( priceEl );
	const moment = useLocalizedMoment();

	const isDiscounted = isFinite( discountedPrice );
	const parsedHeadingLevel = isNumber( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel ), 1 ), 6 )
		: 2;
	const parsedExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	const renderBillingTimeFrame = (
		productExpiryDate: Moment | null,
		billingTerm: TranslateResult
	) => {
		return productExpiryDate ? (
			<time
				className="jetpack-product-card__expiration-date"
				dateTime={ productExpiryDate.format( 'YYYY-DD-YY' ) }
			>
				{ translate( 'expires %(date)s', {
					args: {
						date: productExpiryDate.format( 'L' ),
					},
				} ) }
			</time>
		) : (
			<span className="jetpack-product-card__billing-time-frame">{ billingTerm }</span>
		);
	};

	return (
		<div
			className={ classNames( className, 'jetpack-product-card', {
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'with-nudge': !! UpgradeNudge,
				'is-featured': isHighlighted,
			} ) }
			data-icon={ iconSlug }
		>
			<header className="jetpack-product-card__header">
				<ProductIcon className="jetpack-product-card__icon" slug={ iconSlug } />
				<div className="jetpack-product-card__summary">
					<div className="jetpack-product-card__headings">
						{ createElement(
							`h${ parsedHeadingLevel }`,
							{ className: 'jetpack-product-card__product-name' },
							<>
								{ preventWidows( productName ) }
								{ productType && (
									<span className="jetpack-product-card__product-type">
										{ ' ' }
										{ preventWidows( productType ) }
									</span>
								) }
							</>
						) }
						{ subheadline && (
							<p className="jetpack-product-card__subheadline">{ preventWidows( subheadline ) }</p>
						) }
					</div>
					{ ! hidePrice && (
						<div
							className={ classNames( 'jetpack-product-card__price', {
								'is-left-aligned': hidePrice && isHeaderWrapped,
							} ) }
							ref={ priceEl }
						>
							{ currencyCode && originalPrice ? (
								<span className="jetpack-product-card__raw-price">
									{ withStartingPrice && (
										<span className="jetpack-product-card__from">{ translate( 'from' ) }</span>
									) }
									<PlanPrice
										rawPrice={ originalPrice }
										original={ isDiscounted }
										currencyCode={ currencyCode }
									/>
									{ isDiscounted && (
										<PlanPrice
											rawPrice={ discountedPrice }
											discounted
											currencyCode={ currencyCode }
										/>
									) }
								</span>
							) : (
								<div className="jetpack-product-card__price-placeholder" />
							) }
							{ currencyCode && originalPrice ? (
								renderBillingTimeFrame( parsedExpiryDate, billingTimeFrame )
							) : (
								<div className="jetpack-product-card__time-frame-placeholder" />
							) }
						</div>
					) }
				</div>
				{ badgeLabel && <div className="jetpack-product-card__badge">{ badgeLabel }</div> }
			</header>
			<div className="jetpack-product-card__body">
				{ discountMessage && (
					<p className="jetpack-product-card__discount-message">
						{ preventWidows( discountMessage ) }
					</p>
				) }
				<Button
					className="jetpack-product-card__button"
					primary={ isHighlighted || !! cancelLabel }
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
				{ cancelLabel && (
					<Button className="jetpack-product-card__cancel" onClick={ onCancelClick }>
						{ cancelLabel }
					</Button>
				) }
				{ description && <p className="jetpack-product-card__description">{ description }</p> }
				{ children && <div className="jetpack-product-card__children">{ children }</div> }
			</div>
			{ features && features.items.length > 0 && (
				<JetpackProductCardFeatures
					features={ features }
					productSlug={ productSlug }
					isExpanded={ isExpanded }
				/>
			) }
			{ UpgradeNudge }
		</div>
	);
};

export default JetpackProductCard;
