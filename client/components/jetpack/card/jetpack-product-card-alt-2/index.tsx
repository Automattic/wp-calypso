/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { isFinite, isNumber } from 'lodash';
import React, { createElement, ReactNode, FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ProductIcon } from '@automattic/components';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { durationToText } from 'calypso/my-sites/plans-v2/utils';
import InfoPopover from 'calypso/components/info-popover';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { preventWidows } from 'calypso/lib/formatting';
import PlanPrice from 'calypso/my-sites/plan-price';
import PlanPriceFree from 'calypso/my-sites/plan-price-free';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';
import type { Duration, PurchaseCallback } from 'calypso/my-sites/plans-v2/types';

/**
 * Style dependencies
 */
import './style.scss';
import ribbonSvg from './assets/ribbon.svg';

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
	billingTerm: Duration;
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	badgeLabel?: TranslateResult;
	onButtonClick: PurchaseCallback;
	onSlideOutClick: PurchaseCallback;
	searchRecordsDetails?: ReactNode;
	isHighlighted?: boolean;
	isOwned?: boolean;
	isDeprecated?: boolean;
	expiryDate?: Moment;
	isFree?: boolean;
	withBundleRibbon: boolean;
	onFeaturesToggle?: () => void;
};

export type Props = OwnProps & Partial< FeaturesProps >;

const JetpackProductCardAlt2: FunctionComponent< Props > = ( {
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
	billingTerm,
	buttonLabel,
	buttonPrimary,
	badgeLabel,
	onButtonClick,
	onSlideOutClick,
	searchRecordsDetails,
	isHighlighted,
	isOwned,
	isDeprecated,
	expiryDate,
	features,
	isExpanded,
	isFree,
	productSlug,
	withBundleRibbon,
	onFeaturesToggle,
}: Props ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const isDiscounted = isFinite( discountedPrice );
	const parsedHeadingLevel = isNumber( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel ), 1 ), 6 )
		: 2;
	const parsedExpiryDate =
		moment.isMoment( expiryDate ) && expiryDate.isValid() ? expiryDate : null;

	const renderBillingTimeFrame = ( productExpiryDate: Moment | null, billingTerm: Duration ) => {
		return productExpiryDate ? (
			<time
				className="jetpack-product-card-alt-2__expiration-date"
				dateTime={ productExpiryDate.format( 'YYYY-DD-YY' ) }
			>
				{ translate( 'expires %(date)s', {
					args: {
						date: productExpiryDate.format( 'L' ),
					},
				} ) }
			</time>
		) : (
			<span className="jetpack-product-card-alt-2__billing-time-frame">
				{ durationToText( billingTerm ) }
			</span>
		);
	};

	const buttonElt = (
		<Button
			primary={ buttonPrimary }
			className="jetpack-product-card-alt-2__button"
			onClick={ onButtonClick }
		>
			{ buttonLabel }
		</Button>
	);

	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const onOpenSearchPopover = useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_plans_infopopover_open', {
					site_id: siteId || undefined,
					item_slug: 'jetpack-search-record-count',
				} )
			),
		[ dispatch, siteId ]
	);

	// We should only display the decimal amount for USD prices
	let displayPrice;
	if ( 'USD' === currencyCode ) {
		displayPrice = isDiscounted ? discountedPrice : originalPrice;
	} else {
		displayPrice = Math.floor( isDiscounted ? discountedPrice : originalPrice );
	}

	return (
		<div
			className={ classNames( className, 'jetpack-product-card-alt-2', {
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-featured': isHighlighted,
				'is-expanded': isExpanded,
			} ) }
			data-e2e-product-slug={ productSlug }
		>
			{ withBundleRibbon && (
				<div className="jetpack-product-card-alt-2__ribbon">
					<span className="jetpack-product-card-alt-2__ribbon-text">{ translate( 'Bundle' ) }</span>
					<img className="jetpack-product-card-alt-2__ribbon-img" src={ ribbonSvg } alt="" />
				</div>
			) }
			<div className="jetpack-product-card-alt-2__summary">
				<header className="jetpack-product-card-alt-2__header">
					<ProductIcon className="jetpack-product-card-alt-2__icon" slug={ iconSlug } />
					{ createElement(
						`h${ parsedHeadingLevel }`,
						{ className: 'jetpack-product-card-alt-2__product-name' },
						<>
							{ preventWidows( productName ) }
							{ productType && (
								<span className="jetpack-product-card-alt-2__product-type">
									{ ' ' }
									{ preventWidows( productType ) }
								</span>
							) }
						</>
					) }

					{ subheadline && (
						<p className="jetpack-product-card-alt-2__subheadline">
							{ preventWidows( subheadline ) }
						</p>
					) }

					{ isFree ? (
						<PlanPriceFree productSlug={ productSlug } />
					) : (
						<div className="jetpack-product-card-alt-2__price">
							{ currencyCode && originalPrice ? (
								<>
									<span className="jetpack-product-card-alt-2__raw-price">
										<PlanPrice rawPrice={ displayPrice } discounted currencyCode={ currencyCode } />
										{ searchRecordsDetails && (
											<InfoPopover
												className="jetpack-product-card-alt-2__search-price-popover"
												position="right"
												iconSize={ 24 }
												onOpen={ onOpenSearchPopover }
											>
												{ searchRecordsDetails }
											</InfoPopover>
										) }
									</span>
									{ renderBillingTimeFrame( parsedExpiryDate, billingTerm ) }
								</>
							) : (
								<>
									<div className="jetpack-product-card-alt-2__price-placeholder" />
									<div className="jetpack-product-card-alt-2__time-frame-placeholder" />
								</>
							) }
						</div>
					) }
				</header>
				<div className="jetpack-product-card-alt-2__body">
					{ badgeLabel && <p className="jetpack-product-card-alt-2__owned">{ badgeLabel }</p> }
					{ buttonElt }
					{ description && (
						<p className="jetpack-product-card-alt-2__description">{ description }</p>
					) }
				</div>
			</div>
			{ features && features.items.length > 0 && (
				<JetpackProductCardFeatures
					className="jetpack-product-card-alt-2__features"
					features={ features }
					productSlug={ productSlug }
					billingTerm={ billingTerm }
					isExpanded={ isExpanded }
					onFeaturesToggle={ onFeaturesToggle }
					ctaElt={ buttonElt }
					onButtonClick={ onSlideOutClick }
				/>
			) }
		</div>
	);
};

export default JetpackProductCardAlt2;
