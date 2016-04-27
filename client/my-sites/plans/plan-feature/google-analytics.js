/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import page from 'page';
import FeatureComparison from 'my-sites/feature-comparison';
import PlanCompareCard from 'my-sites/plan-compare-card';
import PlanCompareCardItem from 'my-sites/plan-compare-card/item';
import sitesList from 'lib/sites-list';

import {
	PLAN_FREE,
	PLAN_BUSINESS,
	FEATURE_CUSTOM_DESIGN,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_NO_ADS,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_VIDEO_UPLOADS
} from 'lib/plans/constants';

import {
	getFeatureTitle,
	getSitePlanSlug,
	planHasFeature,
	getPlan
} from 'lib/plans';

import PlanFeatureFooter from './footer';

const sites = sitesList();

export default function( context ) {
	window.scrollTo( 0, 0 );

	const site = sites.getSelectedSite();
	const planSlug = ( site && site.ID ) ? getSitePlanSlug( site.ID ) : PLAN_FREE;

	const SvgLogo = () => (
		<svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
			<title>icon - google analytics</title>
			<g fill="none" fillRule="evenodd">
				<rect fillOpacity=".27" fill="#C8D7E1" x="4" y="4" width="80" height="80" rx="6"/>
				<rect fill="#FFF" width="80" height="80" rx="6"/>
				<path d="M45.16 49.896a8 8 0 1 1-14.137 4.477l-11.036-6.117A7.966 7.966 0 0 1 15 50c-.57 0-1.124-.06-1.66-.172L0 62.71v11.293A5.997 5.997 0 0 0 5.997 80h68.006A5.997 5.997 0 0 0 80 74.003V33.75l-12.512-8.127A7.963 7.963 0 0 1 63 27c-.76 0-1.495-.106-2.19-.304l-15.65 23.2z" stroke="#F05824" strokeWidth="2" fillOpacity=".62" fill="#F05824"/><path d="M39.847 47.044A7.97 7.97 0 0 0 33.707 49l-10.773-5.97A8 8 0 1 0 8.292 46.36L0 54.37V5.996A5.997 5.997 0 0 1 5.997 0h68.006A5.997 5.997 0 0 1 80 5.997v20.597l-9.168-5.954a8 8 0 1 0-14.764 2.356l-16.22 24.048z" stroke="#F79A1F" strokeWidth="2" fillOpacity=".68" fill="#F79A1F"/>
			</g>
		</svg>
	);

	const SvgIllustration = () => (
		<svg width="720" height="168" viewBox="0 0 720 168" xmlns="http://www.w3.org/2000/svg">
			<title>figure</title>
			<defs>
				<path id="a" d="M0 0h720v168H0z"/>
				<path id="c" d="M3.958 95.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06L580.333.87l64.178 18.397 63.95 52.7 64.12 23.122v50.48H.48"/>
			</defs>
			<g fill="none" fillRule="evenodd">
				<mask id="b" fill="#fff">
					<use xlinkHref="#a"/>
				</mask>
				<use xlinkHref="#a"/>
				<g mask="url(#b)">
					<g transform="translate(-24 -22)">
						<g transform="translate(0 61)">
							<mask id="d" fill="#fff">
								<use xlinkHref="#c"/>
							</mask>
							<use xlinkHref="#c"/>
							<g mask="url(#d)" fillOpacity=".05" fill="#44B963">
								<path d="M20 98h31v39H20zM84-31h31v177H84zM142-31h31v177h-31zM200-31h31v177h-31zM258-31h31v177h-31zM316-31h31v177h-31zM374-31h31v177h-31zM432-31h31v177h-31zM490-31h31v177h-31zM548-31h31v177h-31zM606-31h31v177h-31zM664-31h31v177h-31zM724-31h31v177h-31z"/>
							</g>
						</g>
						<path d="M4.958 159.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06 64.15-45.218 64.178 18.397 63.95 52.7 64.12 23.122" strokeOpacity=".12" stroke="#44B963" strokeWidth="4"/>
						<path d="M3.958 156.457l64.13 10.647 64.447-30.737 63.947 15.8 62.526-45.334 64.804-26.5 64.646 12.724 63.263 35.09 64.463-21.06 64.15-45.218 64.178 18.397 63.95 52.7 64.12 23.122v50.48H.48" strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fillOpacity=".05" fill="#44B963"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="68" cy="167" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="132" cy="137" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="196" cy="152" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="259" cy="107" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="324" cy="80" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="388" cy="93" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="452" cy="128" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="516" cy="107" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="580" cy="62" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="644" cy="80" r="4"/>
						<circle strokeOpacity=".62" stroke="#44B963" strokeWidth="2" fill="#FFF" cx="708" cy="133" r="4"/>
					</g>
					<path d="M541 6.005c0-1.107.888-2.005 2-2.005h35c1.104 0 2 .897 2 2.005v19.99A1.997 1.997 0 0 1 578 28h-13.657l-4.053 3-4.018-3h-13.275A2 2 0 0 1 541 25.995V6.005z" fillOpacity=".27" fill="#C8D7E1"/>
					<path d="M537 2.005C537 .898 537.888 0 539 0h35c1.104 0 2 .897 2 2.005v19.99A1.997 1.997 0 0 1 574 24h-13.657l-4.053 3-4.018-3h-13.275A2 2 0 0 1 537 21.995V2.005z" stroke="#C8D7E1" fill="#FFF"/>
					<text fontFamily="AppleColorEmoji, Apple Color Emoji" fontSize="14" fill="#000" transform="translate(537)">
						<tspan x="12" y="17">🎉</tspan>
					</text>
				</g>
			</g>
		</svg>
	);

	function goBack() {
		const fallback = '/plans/' + ( context.params.domain || '' );
		if ( ! context.prevPath || context.prevPath.indexOf( context.params.domain ) === -1 ) {
			page( fallback );
		} else {
			page.back( fallback );
		}
	}

	function checkoutBusinessPlan() {
		page( '/checkout/' + context.params.domain + '/business' );
	}

	const featuresToShow = [
		FEATURE_UNLIMITED_STORAGE,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_LIVE_CHAT_SUPPORT,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_CUSTOM_DESIGN,
		FEATURE_VIDEO_UPLOADS
	];

	let comparisonCard;
	if ( planSlug === PLAN_BUSINESS ) {
		comparisonCard = ( <Card href={ '/settings/analytics/' + site.slug }>{ i18n.translate( 'Configure Google Analytics' ) }</Card> );
	} else if ( site.jetpack ) {
		comparisonCard = ( <Card href={ site.URL + '/wp-admin' }>{ i18n.translate( 'Your site is a Jetpack site hosted on your own server. Most likely you can configure Google Analytics in your admin panel.' ) }</Card> );
	} else {
		comparisonCard = (
			<FeatureComparison>
				<PlanCompareCard
					title={ getPlan( planSlug ).getTitle() }
					line={ getPlan( planSlug ).getPriceTitle() }
					buttonName={ i18n.translate( 'Your Plan' ) }
					currentPlan={ true } >
					<PlanCompareCardItem unavailable={ true } >
						{ i18n.translate( 'Google Analytics' ) }
					</PlanCompareCardItem>
					{
						featuresToShow.map( feature => <PlanCompareCardItem
								key={ feature }
								unavailable={ ! planHasFeature( planSlug, feature ) }
							>
								{ getFeatureTitle( feature ) }
							</PlanCompareCardItem>
						)
					}
				</PlanCompareCard>
				<PlanCompareCard
					title={ getPlan( PLAN_BUSINESS ).getTitle() }
					line={ getPlan( PLAN_BUSINESS ).getPriceTitle() }
					buttonName={ i18n.translate( 'Upgrade' ) }
					onClick={ checkoutBusinessPlan }
					currentPlan={ false }
					popularRibbon={ true } >
					<PlanCompareCardItem highlight={ true } >
						{ i18n.translate( 'Google Analytics' ) }
					</PlanCompareCardItem>
					{
						featuresToShow.map( feature => <PlanCompareCardItem key={ feature }>
							{ getFeatureTitle( feature ) }
						</PlanCompareCardItem> )
					}
				</PlanCompareCard>
			</FeatureComparison>
		);
	}

	renderWithReduxStore(
		<Main>
			<HeaderCake onClick={ goBack }>{ i18n.translate( 'Google Analytics' ) }</HeaderCake>
			<Card compact>
				<div className="plan-feature__logo">
					<SvgLogo />
				</div>
				<h1 className="plan-feature__title">{ i18n.translate( 'Use Google Analytics with Business' ) }</h1>
				<span className="plan-feature__description">
					{ i18n.translate( 'Upgrade to Business to use your own Google Analytics, get a custom domain, and much more.' ) }
				</span>
				<div className="plan-feature__ilustration">
					<SvgIllustration />
				</div>
			</Card>
			{ comparisonCard }
			<PlanFeatureFooter />
		</Main>,
		document.getElementById( 'primary' ),
		context.store
	);
}
