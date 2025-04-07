import { Popover } from '@automattic/components';
import { Card } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, getCurrencyObject } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { COMPONENT_CLASS_NAME } from './stats-purchase-consts';
import StatsPurchasePreviewImage from './stats-purchase-preview-image';

interface StatsCommercialPriceDisplayProps {
	planValue: number;
	currencyCode: string;
}

interface StatsSingleItemPagePurchaseFrameProps {
	children: React.ReactNode;
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

	const spikeInfoIconRef = useRef( null );
	const overageInfoIconRef = useRef( null );
	const trackingInfoIconRef = useRef( null );
	const commercialInfoIconRef = useRef( null );
	const customDateRangesInfoIconRef = useRef( null );
	const deviceAttributesInfoIconRef = useRef( null );
	const [ spikeInfoShow, setSpikeInfoShow ] = useState( false );
	const handleSpikePopoverOpen = () => setSpikeInfoShow( true );
	const handleSpikePopoverClose = () => setSpikeInfoShow( false );
	const [ overageInfoShow, setOverageInfoShow ] = useState( false );
	const handleOveragePopoverOpen = () => setOverageInfoShow( true );
	const handleOveragePopoverClose = () => setOverageInfoShow( false );
	const [ trackingInfoShow, setTrackingInfoShow ] = useState( false );
	const handleUTMTrackingPopoverOpen = () => setTrackingInfoShow( true );
	const handleUTMTrackingPopoverClose = () => setTrackingInfoShow( false );
	const [ commercialInfoShow, setCommercialInfoShow ] = useState( false );
	const handleCommercialUsePopoverOpen = () => setCommercialInfoShow( true );
	const handleCommercialUsePopoverClose = () => setCommercialInfoShow( false );
	const [ customDateRangesInfoShow, setCustomDateRangesInfoShow ] = useState( false );
	const handleCustomDatesPopoverOpen = () => setCustomDateRangesInfoShow( true );
	const handleCustomDatesPopoverClose = () => setCustomDateRangesInfoShow( false );
	const [ deviceAttributesInfoShow, setDeviceAttributesInfoShow ] = useState( false );
	const handleDeviceAttributesPopoverOpen = () => setDeviceAttributesInfoShow( true );
	const handleDeviceAttributesPopoverClose = () => setDeviceAttributesInfoShow( false );

	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
				<li>{ translate( 'Real-time data on visitors' ) }</li>
				<li>{ translate( 'Traffic stats and trends for posts and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliance' ) }</li>
				<li>{ translate( 'Access to upcoming advanced features' ) }</li>
				<li>{ translate( 'Priority support' ) }</li>
				<li>
					{ translate( '{{strong}}Commercial use{{/strong}}', {
						components: { strong: <strong /> },
					} ) }
					<Icon
						icon={ info }
						ref={ commercialInfoIconRef }
						onMouseEnter={ handleCommercialUsePopoverOpen }
						onMouseLeave={ handleCommercialUsePopoverClose }
					/>
				</li>
				<li>
					{ translate( 'Custom date ranges' ) }
					<Icon
						icon={ info }
						ref={ customDateRangesInfoIconRef }
						onMouseEnter={ handleCustomDatesPopoverOpen }
						onMouseLeave={ handleCustomDatesPopoverClose }
					/>
				</li>
				<li>
					{ translate( 'View device attributes' ) }
					<Icon
						icon={ info }
						ref={ deviceAttributesInfoIconRef }
						onMouseEnter={ handleDeviceAttributesPopoverOpen }
						onMouseLeave={ handleDeviceAttributesPopoverClose }
					/>
				</li>
				<li>
					{ translate( 'UTM tracking' ) }
					<Icon
						icon={ info }
						ref={ trackingInfoIconRef }
						onMouseEnter={ handleUTMTrackingPopoverOpen }
						onMouseLeave={ handleUTMTrackingPopoverClose }
					/>
				</li>
				<li>
					{ translate( 'Traffic spike forgiveness' ) }
					<Icon
						icon={ info }
						ref={ spikeInfoIconRef }
						onMouseEnter={ handleSpikePopoverOpen }
						onMouseLeave={ handleSpikePopoverClose }
					/>
				</li>
				<li>
					{ translate( 'Overage forgiveness' ) }
					<Icon
						icon={ info }
						ref={ overageInfoIconRef }
						onMouseEnter={ handleOveragePopoverOpen }
						onMouseLeave={ handleOveragePopoverClose }
					/>
				</li>
			</ul>
			<Popover
				position="right"
				isVisible={ spikeInfoShow }
				context={ spikeInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate(
						"You won't incur additional charges for occasional traffic spikes, nor will we cease tracking your statistics due to such spikes." // TODO: We need a 'learn more' link here.
					) }
				</div>
			</Popover>
			<Popover
				position="right"
				isVisible={ overageInfoShow }
				context={ overageInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate(
						'You will only be prompted to upgrade to higher tiers when you exceed the limit for three consecutive periods.' // TODO: We need a 'learn more' link here.
					) }
				</div>
			</Popover>
			<Popover
				position="right"
				isVisible={ trackingInfoShow }
				context={ trackingInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate(
						'It enables you to measure and track traffic through UTM parameters in your URLs, providing a method to assess the success of your campaigns.'
					) }
				</div>
			</Popover>
			<Popover
				position="right"
				isVisible={ commercialInfoShow }
				context={ commercialInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate(
						'Your Stats license will be valid for commercial use. Any site with commercial activity requires a commercial-use license.'
					) }
				</div>
			</Popover>
			<Popover
				position="right"
				isVisible={ customDateRangesInfoShow }
				context={ customDateRangesInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate( 'Select custom date ranges when inspecting your site traffic.' ) }
				</div>
			</Popover>
			<Popover
				position="right"
				isVisible={ deviceAttributesInfoShow }
				context={ deviceAttributesInfoIconRef.current }
				className="stats-purchase__info-popover"
			>
				<div className="stats-purchase__info-popover-content">
					{ translate( 'Get detailed devices stats for your site visitors.' ) }
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
				<li>{ translate( 'Traffic stats and trends for posts and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliance' ) }</li>
				{ /** TODO: check sub price for validation -  will need support added to use-stats-purchases hook */ }
				<li>{ translate( 'Email support' ) }</li>
			</ul>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
				<li>{ translate( 'No UTM tracking' ) }</li>
				<li>{ translate( 'No access to upcoming advanced features' ) }</li>
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
				<li>{ translate( 'Traffic stats and trends for posts and pages' ) }</li>
				<li>{ translate( 'Detailed statistics about links leading to your site' ) }</li>
				<li>{ translate( 'GDPR compliance' ) }</li>
			</ul>
			<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
				<li>{ translate( 'No UTM tracking' ) }</li>
				<li>{ translate( 'No access to upcoming advanced features' ) }</li>
				<li>{ translate( 'No Email support (supported by forum)' ) }</li>
				<li>{ translate( 'No commercial use' ) }</li>
			</ul>
		</div>
	);
};

const StatsSingleItemPagePurchaseFrame = ( {
	children,
}: StatsSingleItemPagePurchaseFrameProps ) => {
	return (
		<div className={ clsx( COMPONENT_CLASS_NAME, `${ COMPONENT_CLASS_NAME }--single` ) }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--left` }>{ children }</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchasePreviewImage />
					</div>
				</div>
			</Card>
		</div>
	);
};

const StatsSingleItemCard = ( { children }: { children: React.ReactNode } ) => {
	return (
		<div className={ clsx( COMPONENT_CLASS_NAME, `${ COMPONENT_CLASS_NAME }--single` ) }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--single` }>{ children }</div>
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
	StatsSingleItemCard,
};
