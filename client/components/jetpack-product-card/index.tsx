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
import PlanPrice from 'my-sites/plan-price';
import JetpackProductCardFeatures from './features';
import useFlexboxWrapDetection from './lib/use-flexbox-wrap-detection';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	className?: string;
	iconSlug: string;
	productName: string;
	productType?: string;
	subheadline: string;
	description: ReactNode;
	originalPrice: number;
	discountedPrice?: number;
	withStartingPrice?: boolean;
	billingTimeFrame: string;
	badgeLabel?: string;
	buttonLabel: string;
	onButtonClick: () => void;
	features: ReactNode;
}

const JetpackProductCard: FunctionComponent< Props > = ( {
	className,
	iconSlug,
	productName,
	productType,
	subheadline,
	description,
	originalPrice,
	discountedPrice,
	withStartingPrice,
	billingTimeFrame,
	badgeLabel,
	buttonLabel,
	onButtonClick,
	features,
} ) => {
	const translate = useTranslate();
	const priceEl = useRef( null );
	const isHeaderWrapped = useFlexboxWrapDetection( priceEl );

	const isDiscounted = isFinite( discountedPrice );

	return (
		<div className={ classNames( className, 'jetpack-product-card' ) }>
			<header className="jetpack-product-card__header">
				<ProductIcon className="jetpack-product-card__icon" slug={ iconSlug } />
				<div className="jetpack-product-card__summary">
					<div className="jetpack-product-card__headings">
						<h1 className="jetpack-product-card__product-name">
							{ productName }
							{ productType && (
								<span className="jetpack-product-card__product-type"> { productType }</span>
							) }
						</h1>
						<p className="jetpack-product-card__subheadline">{ subheadline }</p>
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
							<PlanPrice rawPrice={ originalPrice } original={ isDiscounted } />
							{ isDiscounted && <PlanPrice rawPrice={ discountedPrice } discounted /> }
						</span>
						<span className="jetpack-product-card__billing-time-frame">{ billingTimeFrame }</span>
					</div>
				</div>
				{ badgeLabel && <div className="jetpack-product-card__badge">{ badgeLabel }</div> }
			</header>
			<div className="jetpack-product-card__body">
				<Button className="jetpack-product-card__button" onClick={ onButtonClick }>
					{ buttonLabel }
				</Button>
				<p className="jetpack-product-card__description">{ description }</p>
			</div>
			<JetpackProductCardFeatures features={ features } />
		</div>
	);
};

export default JetpackProductCard;
