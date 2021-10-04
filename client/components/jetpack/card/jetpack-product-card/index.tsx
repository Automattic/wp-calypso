import { Button, ProductIcon } from '@automattic/components';
import classNames from 'classnames';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { createElement, ReactNode, useEffect, useRef } from 'react';
import * as React from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import starIcon from './assets/star.svg';
import DisplayPrice from './display-price';
import JetpackProductCardFeatures from './features';
import type {
	ScrollCardIntoViewCallback,
	SelectorProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

import './style.scss';

type OwnProps = {
	item: SelectorProduct;
	iconSlug?: string;
	headingLevel?: number;
	description?: ReactNode;
	originalPrice: number;
	discountedPrice?: number;
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	onButtonClick: React.MouseEventHandler;
	buttonURL?: string;
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
	featuredLabel?: TranslateResult;
	hideSavingLabel?: boolean;
	scrollCardIntoView?: ScrollCardIntoViewCallback;
};

const JetpackProductCard: React.FC< OwnProps > = ( {
	item,
	iconSlug,
	headingLevel,
	description,
	originalPrice,
	discountedPrice,
	buttonLabel,
	buttonPrimary,
	onButtonClick,
	buttonURL,
	expiryDate,
	isFeatured,
	isOwned,
	isIncludedInPlan,
	isDeprecated,
	isAligned,
	isDisabled,
	disabledMessage,
	displayFrom,
	tooltipText,
	featuredLabel,
	hideSavingLabel,
	aboveButtonText = null,
	scrollCardIntoView,
} ) => {
	const translate = useTranslate();
	const parsedHeadingLevel = Number.isFinite( headingLevel )
		? Math.min( Math.max( Math.floor( headingLevel as number ), 1 ), 6 )
		: 2;
	const parsedSubheadingLevel = Math.min( parsedHeadingLevel + 1, 6 );

	const anchorRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		// The <DisplayPrice /> appearance changes the layout of the page and breaks the scroll into view behavior. Therefore, we will only scroll the element into view once the price is fully loaded.
		if ( anchorRef && anchorRef.current && originalPrice ) {
			scrollCardIntoView && scrollCardIntoView( anchorRef.current, item.productSlug );
		}
	}, [ originalPrice ] );

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
			data-e2e-product-slug={ item.productSlug }
		>
			<div className="jetpack-product-card__scroll-anchor" ref={ anchorRef }></div>
			{ isFeatured && (
				<div className="jetpack-product-card__header">
					<img className="jetpack-product-card__header-icon" src={ starIcon } alt="" />
					<span>{ featuredLabel || translate( 'Recommended' ) }</span>
				</div>
			) }
			<div className="jetpack-product-card__body">
				{ iconSlug && <ProductIcon className="jetpack-product-card__icon" slug={ iconSlug } /> }
				{ createElement(
					`h${ parsedHeadingLevel }`,
					{ className: 'jetpack-product-card__product-name' },
					<>{ item.displayName }</>
				) }
				{ item.subheader &&
					createElement(
						`h${ parsedSubheadingLevel }`,
						{ className: 'jetpack-product-card__product-subheader' },
						<>{ item.subheader }</>
					) }

				<DisplayPrice
					isDeprecated={ isDeprecated }
					isOwned={ isOwned }
					isIncludedInPlan={ isIncludedInPlan }
					isFree={ item.isFree }
					discountedPrice={ discountedPrice }
					currencyCode={ item.displayCurrency }
					originalPrice={ originalPrice }
					displayFrom={ displayFrom }
					belowPriceText={ item.belowPriceText }
					expiryDate={ expiryDate }
					billingTerm={ item.displayTerm || item.term }
					tooltipText={ tooltipText }
					productName={ item.displayName }
					hideSavingLabel={ hideSavingLabel }
				/>

				{ aboveButtonText && (
					<p className="jetpack-product-card__above-button">{ aboveButtonText }</p>
				) }
				{ isDisabled && disabledMessage && (
					<p className="jetpack-product-card__disabled-message">
						{ preventWidows( disabledMessage ) }
					</p>
				) }
				{ ! isDisabled &&
					( buttonURL ? (
						<Button
							primary={ buttonPrimary }
							className="jetpack-product-card__button"
							onClick={ onButtonClick }
							href={ buttonURL }
							disabled={ isDeprecated }
						>
							{ buttonLabel }
						</Button>
					) : (
						<Button
							primary={ buttonPrimary }
							className="jetpack-product-card__button"
							onClick={ onButtonClick }
							disabled={ isDeprecated }
						>
							{ buttonLabel }
						</Button>
					) ) }

				{ description && <p className="jetpack-product-card__description">{ description }</p> }
				{ item.features && item.features.items.length > 0 && (
					<JetpackProductCardFeatures features={ item.features } />
				) }
			</div>
		</div>
	);
};

export default JetpackProductCard;
