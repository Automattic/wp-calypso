import { Popover } from '@automattic/components';
import { getCurrencyObject } from '@automattic/format-currency';
import { Card } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import statsPurchaseBackgroundSVG from 'calypso/assets/images/stats/purchase-background.svg';
import StatsPurchaseSVG from './stats-purchase-svg';
import { COMPONENT_CLASS_NAME } from './stats-purchase-wizard';

interface StatsCommercialPriceDisplayProps {
	planValue: number;
	currencyCode: string;
}

const StatsCommercialPriceDisplay = ( {
	planValue,
	currencyCode,
}: StatsCommercialPriceDisplayProps ) => {
	const translate = useTranslate();
	const planValuePerMonth = planValue / 12;
	const planPriceObject = getCurrencyObject( planValuePerMonth, currencyCode );

	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__pricing` }>
			<div className={ `${ COMPONENT_CLASS_NAME }__pricing-value` }>
				{ planPriceObject.symbolPosition === 'before' && (
					<div className={ `${ COMPONENT_CLASS_NAME }__pricing-currency` }>
						{ planPriceObject.symbol }
					</div>
				) }
				<div className={ `${ COMPONENT_CLASS_NAME }__pricing-amount` }>
					{ `${ planPriceObject.integer }` }
					{ planPriceObject.hasNonZeroFraction && <sup>{ `${ planPriceObject.fraction }` }</sup> }
				</div>
				{ planPriceObject.symbolPosition === 'after' && (
					<div className={ `${ COMPONENT_CLASS_NAME }__pricing-currency` }>
						{ planPriceObject.symbol }
					</div>
				) }
			</div>
			<div className={ `${ COMPONENT_CLASS_NAME }__pricing-cadency` }>
				/{ translate( 'month, billed yearly' ) }
			</div>
		</div>
	);
};

const StatsBenefitsCommercial = () => {
	const translate = useTranslate();

	const infoIconRef = useRef( null );
	const [ show, setShow ] = useState( false );
	const handlePopoverOpen = () => setShow( true );
	const handlePopoverClose = () => setShow( false );

	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
				<li>{ translate( 'Real-time data on visitors' ) }</li>
				<li>{ translate( 'Traffic stats and trends for post and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliant' ) }</li>
				<li>{ translate( 'Access to upcoming advanced features' ) }</li>
				<li>{ translate( 'Priority support' ) }</li>
				<li>{ translate( 'Commercial use' ) }</li>
				<li>
					{ translate( 'Traffic spike forgiveness' ) }
					<Icon
						icon={ info }
						ref={ infoIconRef }
						onMouseEnter={ handlePopoverOpen }
						onMouseLeave={ handlePopoverClose }
					/>
				</li>
			</ul>
			<Popover
				position="right"
				isVisible={ show }
				context={ infoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate( "We'll exclude the two days of the month with the highest page views." ) }
				</div>
			</Popover>
		</div>
	);
};

const StatsBenefitsPersonal = () => {
	const translate = useTranslate();

	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
				<li>{ translate( 'Real-time data on visitors' ) }</li>
				<li>{ translate( 'Traffic stats and trends for post and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliant' ) }</li>
				<li>{ translate( 'Access to upcoming advanced features' ) }</li>
				{ /** TODO: check sub price for validation -  will need support added to use-stats-purchases hook */ }
				<li>{ translate( 'Priority support' ) }</li>
			</ul>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
				<li>{ translate( 'No commercial use' ) }</li>
			</ul>
		</div>
	);
};

const StatsBenefitsFree = () => {
	const translate = useTranslate();

	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
				<li>{ translate( 'Real-time data on visitors' ) }</li>
				<li>{ translate( 'Traffic stats and trends for post and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliant' ) }</li>
			</ul>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
				<li>{ translate( 'No access to upcoming features' ) }</li>
				<li>{ translate( 'No priority support' ) }</li>
				<li>{ translate( 'No commercial use' ) }</li>
			</ul>
		</div>
	);
};

interface StatsSingleItemPagePurchaseFrameProps {
	children: React.ReactNode;
	isFree?: boolean;
}

const StatsSingleItemPagePurchaseFrame = ( {
	children,
	isFree = false,
}: StatsSingleItemPagePurchaseFrameProps ) => {
	return (
		<div className={ classNames( COMPONENT_CLASS_NAME, `${ COMPONENT_CLASS_NAME }--single` ) }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--left` }>{ children }</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchaseSVG isFree={ isFree } hasHighlight={ false } extraMessage={ false } />
						<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right-background` }>
							<img src={ statsPurchaseBackgroundSVG } alt="Blurred background" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export {
	StatsCommercialPriceDisplay,
	StatsBenefitsCommercial,
	StatsBenefitsPersonal,
	StatsBenefitsFree,
	StatsSingleItemPagePurchaseFrame,
};
