/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { isFinite } from 'lodash';
import React, { useRef, FunctionComponent, ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { Button, ProductIcon } from '@automattic/components';
import { preventWidows } from 'lib/formatting';
import PlanPrice from 'my-sites/plan-price';
import JetpackProductCardFeatures, { Props as FeaturesProps } from './features';
import useFlexboxWrapDetection from './lib/use-flexbox-wrap-detection';

/**
 * Style dependencies
 */
import './style.scss';

type OwnProps = {
	className?: string;
	iconSlug: string;
	productName: string;
	productType?: string;
	subheadline: string;
	description: ReactNode;
	currencyCode: string;
	originalPrice: number;
	discountedPrice?: number;
	withStartingPrice?: boolean;
	billingTimeFrame: string;
	badgeLabel?: string;
	discountMessage?: string;
	buttonLabel: string;
	onButtonClick: () => void;
	cancelLabel?: string;
	onCancelClick?: () => void;
	isHighlighted?: boolean;
	isOwned?: boolean;
};

export type Props = OwnProps & FeaturesProps;

const JetpackProductCard: FunctionComponent< Props > = ( {
	className,
	iconSlug,
	productName,
	productType,
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
	isHighlighted,
	isOwned,
	features,
	isExpanded,
} ) => {
	const translate = useTranslate();
	const priceEl = useRef( null );
	const isHeaderWrapped = useFlexboxWrapDetection( priceEl );

	const isDiscounted = isFinite( discountedPrice );

	return (
		<div className={ classNames( className, 'jetpack-product-card', { 'is-owned': isOwned } ) }>
			<header className="jetpack-product-card__header">
				<ProductIcon className="jetpack-product-card__icon" slug={ iconSlug } />
				<div className="jetpack-product-card__summary">
					<div className="jetpack-product-card__headings">
						<h1 className="jetpack-product-card__product-name">
							{ preventWidows( productName ) }
							{ productType && (
								<span className="jetpack-product-card__product-type">
									{ ' ' }
									{ preventWidows( productType ) }
								</span>
							) }
						</h1>
						<p className="jetpack-product-card__subheadline">{ preventWidows( subheadline ) }</p>
					</div>
					<div
						className={ classNames( 'jetpack-product-card__price', {
							'is-left-aligned': isHeaderWrapped,
						} ) }
						ref={ priceEl }
					>
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
								<PlanPrice rawPrice={ discountedPrice } discounted currencyCode={ currencyCode } />
							) }
						</span>
						<span className="jetpack-product-card__billing-time-frame">{ billingTimeFrame }</span>
					</div>
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
				<p className="jetpack-product-card__description">{ description }</p>
			</div>
			<JetpackProductCardFeatures features={ features } isExpanded={ isExpanded } />
		</div>
	);
};

export default JetpackProductCard;
