import { Button } from '@automattic/components';
import { SVG, Path } from '@wordpress/components';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { createElement, ReactNode, useEffect, useRef } from 'react';
import DisplayPrice from './display-price';
import JetpackProductCardFeatures from './features';
import type {
	ScrollCardIntoViewCallback,
	SelectorProduct,
} from 'calypso/my-sites/plans/jetpack-plans/types';
import type { Moment } from 'moment';

import './style.scss';

type OwnProps = {
	className?: string;
	item: SelectorProduct;
	// Disallow h6, so it can be used for a sub-header if needed
	headerLevel: 1 | 2 | 3 | 4 | 5;
	description?: ReactNode;
	originalPrice?: number;
	discountedPrice?: number;
	pricesAreFetching?: boolean | null;
	hidePrice?: boolean;
	buttonLabel: TranslateResult;
	buttonPrimary: boolean;
	onButtonClick?: React.MouseEventHandler;
	buttonURL?: string;
	buttonDisabled?: boolean;
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
	showNewLabel?: boolean;
	showAbovePriceText?: boolean;
	scrollCardIntoView?: ScrollCardIntoViewCallback;
	collapseFeaturesOnMobile?: boolean;
};

type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeaderProps = {
	className?: string;
	level: HeaderLevel;
	children?: React.ReactNode;
};
const Header: React.FC< HeaderProps > = ( { level, children, ...headerProps } ) =>
	createElement( `h${ level }`, headerProps, children );

const JetpackProductCard: React.FC< OwnProps > = ( {
	className,
	item,
	headerLevel,
	description,
	originalPrice,
	discountedPrice,
	pricesAreFetching,
	hidePrice,
	buttonLabel,
	buttonPrimary,
	onButtonClick,
	buttonURL,
	buttonDisabled,
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
	showNewLabel,
	showAbovePriceText,
	aboveButtonText = null,
	scrollCardIntoView,
	collapseFeaturesOnMobile,
} ) => {
	const isFree = item.isFree;

	const translate = useTranslate();
	const anchorRef = useRef< HTMLDivElement >( null );
	const discount =
		originalPrice !== undefined && discountedPrice !== undefined
			? Math.floor( ( ( originalPrice - discountedPrice ) / originalPrice ) * 100 )
			: 0;
	const showDiscountLabel =
		! hideSavingLabel &&
		discount &&
		discount > 0 &&
		! isFree &&
		! isDisabled &&
		! isOwned &&
		! isDeprecated &&
		! isIncludedInPlan;

	const discountElt = showDiscountLabel
		? translate( '%(percent)d%% off', {
				args: {
					percent: discount,
				},
				comment: 'Should be as concise as possible.',
		  } )
		: null;

	const starIcon = (
		// Safari has problems rendering SVGs in retina screens when used inside an img tag, so we should use inline SVG instead.
		// See details on this PR: https://github.com/Automattic/wp-calypso/pull/65304
		<SVG className="jetpack-product-card__header-icon" width="16" height="16" viewBox="0 0 16 16">
			<Path
				d="M8 11.513 12.12 14l-1.093-4.687 3.64-3.153-4.793-.407-1.873-4.42-1.874 4.42-4.793.407 3.64 3.153L3.881 14 8 11.513Z"
				fill="currentColor"
			/>
		</SVG>
	);

	useEffect( () => {
		// The <DisplayPrice /> appearance changes the layout of the page and breaks the scroll into view behavior. Therefore, we will only scroll the element into view once the price is fully loaded.
		if ( anchorRef && anchorRef.current && originalPrice ) {
			scrollCardIntoView && scrollCardIntoView( anchorRef.current, item.productSlug );
		}
	}, [ originalPrice, item.productSlug, scrollCardIntoView ] );

	return (
		<div
			className={ clsx( 'jetpack-product-card', className, {
				'is-disabled': isDisabled,
				'is-owned': isOwned,
				'is-deprecated': isDeprecated,
				'is-aligned': isAligned,
				'is-featured': isFeatured,
			} ) }
			data-e2e-product-slug={ item.productSlug }
		>
			<div className="jetpack-product-card__scroll-anchor" ref={ anchorRef }></div>
			{ isFeatured && (
				<div className="jetpack-product-card__header">
					{ starIcon }
					<span>{ featuredLabel || translate( 'Recommended' ) }</span>
				</div>
			) }
			<div className="jetpack-product-card__body">
				<header className="jetpack-product-card__heading">
					<Header level={ headerLevel } className="jetpack-product-card__product-name">
						{ item.displayName }
					</Header>
					{ showNewLabel && (
						<span className="jetpack-product-card__new-label">{ translate( 'New' ) }</span>
					) }
					{ discountElt && (
						<span className="jetpack-product-card__discount-label">{ discountElt }</span>
					) }
				</header>
				{ item.subheader && (
					<Header
						level={ ( headerLevel + 1 ) as HeaderLevel }
						className="jetpack-product-card__product-subheader"
					>
						{ item.subheader }
					</Header>
				) }

				{ ! hidePrice && (
					<DisplayPrice
						isDeprecated={ isDeprecated }
						isOwned={ isOwned }
						isIncludedInPlan={ isIncludedInPlan }
						isFree={ item.isFree }
						discountedPrice={ discountedPrice }
						currencyCode={ item.displayCurrency }
						originalPrice={ originalPrice ?? 0 }
						pricesAreFetching={ pricesAreFetching }
						displayFrom={ displayFrom }
						showAbovePriceText={ showAbovePriceText }
						belowPriceText={ item.belowPriceText }
						expiryDate={ expiryDate }
						billingTerm={ item.displayTerm || item.term }
						tooltipText={ tooltipText }
						productName={ item.displayName }
						hideSavingLabel={ hideSavingLabel }
					/>
				) }

				{ aboveButtonText && (
					<p className="jetpack-product-card__above-button">{ aboveButtonText }</p>
				) }
				{ isDisabled && disabledMessage && (
					<p className="jetpack-product-card__disabled-message">{ disabledMessage }</p>
				) }
				{ buttonURL ? (
					<Button
						primary={ buttonPrimary }
						className="jetpack-product-card__button"
						onClick={ onButtonClick }
						href={ isDisabled || buttonDisabled ? '#' : buttonURL }
						disabled={ isDisabled || buttonDisabled || isDeprecated }
					>
						{ buttonLabel }
					</Button>
				) : (
					<Button
						primary={ buttonPrimary }
						className="jetpack-product-card__button"
						onClick={ onButtonClick }
						disabled={ isDisabled || buttonDisabled }
					>
						{ buttonLabel }
					</Button>
				) }

				{ description && <p className="jetpack-product-card__description">{ description }</p> }
				{ item.features && item.features.items.length > 0 && (
					<JetpackProductCardFeatures
						productSlug={ item.productSlug }
						features={ item.features }
						collapseFeaturesOnMobile={ collapseFeaturesOnMobile }
					/>
				) }
				{ item.disclaimer && (
					<span className="jetpack-product-card__disclaimer">{ item.disclaimer }</span>
				) }
			</div>
		</div>
	);
};

export default JetpackProductCard;
