/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { isFinite, isNumber } from 'lodash';
import React, { createElement, ReactNode, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ProductIcon } from '@automattic/components';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
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
	badgeLabel?: TranslateResult;
	onButtonClick: () => void;
	cancelLabel?: TranslateResult;
	onCancelClick?: () => void;
	searchRecordsDetails?: ReactNode;
	isHighlighted?: boolean;
	isOwned?: boolean;
	isDeprecated?: boolean;
	expiryDate?: Moment;
	isFree?: boolean;
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
	searchRecordsDetails,
	isHighlighted,
	isOwned,
	isDeprecated,
	expiryDate,
	features,
	isExpanded,
	isFree,
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

	return (
		<div
			className={ classNames( className, 'jetpack-product-card-alt', {
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-featured': isHighlighted,
			} ) }
			data-e2e-product-slug={ productSlug }
		>
			<div className="jetpack-product-card-alt__summary">
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
						<p className="jetpack-product-card-alt__subheadline">
							{ preventWidows( subheadline ) }
						</p>
					) }

					{ isFree ? (
						<PlanPriceFree productSlug={ productSlug } />
					) : (
						<div className="jetpack-product-card-alt__price">
							{ currencyCode && originalPrice ? (
								<>
									<span className="jetpack-product-card-alt__raw-price">
										{ withStartingPrice && (
											<span className="jetpack-product-card-alt__from">
												{ translate( 'from' ) }
											</span>
										) }

										<PlanPrice
											rawPrice={ isDiscounted ? discountedPrice : originalPrice }
											discounted
											currencyCode={ currencyCode }
										/>

										{ searchRecordsDetails && (
											<InfoPopover
												className="jetpack-product-card-alt__search-price-popover"
												position="right"
												onOpen={ onOpenSearchPopover }
											>
												{ searchRecordsDetails }
											</InfoPopover>
										) }
									</span>
									{ renderBillingTimeFrame( parsedExpiryDate, billingTimeFrame ) }
								</>
							) : (
								<>
									<div className="jetpack-product-card-alt__price-placeholder" />
									<div className="jetpack-product-card-alt__time-frame-placeholder" />
								</>
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
					{ description && (
						<p className="jetpack-product-card-alt__description">{ description }</p>
					) }
				</div>
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
