/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { isFinite, isNumber } from 'lodash';
import React, { createElement, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { Button, ProductIcon } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { preventWidows } from 'calypso/lib/formatting';
import PlanPrice from 'calypso/my-sites/plan-price';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';

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
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	badgeLabel: TranslateResult;
	onButtonClick: () => void;
	cancelLabel?: TranslateResult;
	onCancelClick?: () => void;
	children?: ReactNode;
	isHighlighted?: boolean;
	isOwned?: boolean;
	isDeprecated?: boolean;
	expiryDate?: Moment;
	hidePrice?: boolean;
};

export type Props = OwnProps & Partial< FeaturesProps >;

const JetpackProductCardAlt = ( {
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
	buttonLabel,
	buttonPrimary,
	badgeLabel,
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
	hidePrice,
	productSlug,
}: Props ) => {
	const translate = useTranslate();
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
				className="jetpack-product-card-alt__expiration-date"
				dateTime={ productExpiryDate.format( 'YYYY-DD-YY' ) }
			>
				{ translate( 'expires %(date)s', {
					args: {
						date: productExpiryDate.format( 'L' ),
					},
				} ) }
			</time>
		) : (
			<span className="jetpack-product-card-alt__billing-time-frame">{ billingTerm }</span>
		);
	};

	return (
		<div
			className={ classNames( className, 'jetpack-product-card-alt', {
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-featured': isHighlighted,
			} ) }
			data-icon={ iconSlug }
		>
			<header className="jetpack-product-card-alt__header">
				<ProductIcon className="jetpack-product-card-alt__icon" slug={ iconSlug } />
				{ createElement(
					`h${ parsedHeadingLevel }`,
					{ className: 'jetpack-product-card-alt__product-name' },
					<>
						{ preventWidows( productName ) }
						{ productType && (
							<span className="jetpack-product-card-alt__product-type">
								{ ' ' }
								{ preventWidows( productType ) }
							</span>
						) }
					</>
				) }

				{ subheadline && (
					<p className="jetpack-product-card-alt__subheadline">{ preventWidows( subheadline ) }</p>
				) }

				{ ! hidePrice && (
					<div className="jetpack-product-card-alt__price">
						{ currencyCode && originalPrice ? (
							<span className="jetpack-product-card-alt__raw-price">
								{ withStartingPrice && (
									<span className="jetpack-product-card-alt__from">{ translate( 'from' ) }</span>
								) }

								{ isDiscounted ? (
									<PlanPrice
										rawPrice={ discountedPrice }
										discounted
										currencyCode={ currencyCode }
									/>
								) : (
									<PlanPrice
										rawPrice={ originalPrice }
										original={ isDiscounted }
										currencyCode={ currencyCode }
									/>
								) }
							</span>
						) : (
							<div className="jetpack-product-card-alt__price-placeholder" />
						) }
						{ currencyCode && originalPrice ? (
							renderBillingTimeFrame( parsedExpiryDate, billingTimeFrame )
						) : (
							<div className="jetpack-product-card-alt__time-frame-placeholder" />
						) }
					</div>
				) }
			</header>
			<div className="jetpack-product-card-alt__body">
				<span className="jetpack-product-card-alt__badge">{ badgeLabel }</span>
				<Button
					primary={ buttonPrimary }
					className="jetpack-product-card-alt__button"
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
				{ cancelLabel && (
					<Button className="jetpack-product-card-alt__cancel" onClick={ onCancelClick }>
						{ cancelLabel }
					</Button>
				) }
				{ description && <p className="jetpack-product-card-alt__description">{ description }</p> }
				{ children && <div className="jetpack-product-card-alt__children">{ children }</div> }
			</div>
			{ features && features.items.length > 0 && (
				<JetpackProductCardFeatures
					features={ features }
					productSlug={ productSlug }
					isExpanded={ isExpanded }
				/>
			) }
		</div>
	);
};

export default JetpackProductCardAlt;
