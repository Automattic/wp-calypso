/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import moment from 'moment';
import { select, dispatch } from 'react-redux';
import { translate } from 'i18n-calypso';
import config, { isEnabled } from '@automattic/calypso-config';
import { Plans, User, Site } from '@automattic/data-stores';
import { get, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { getUrlParts } from 'calypso/lib/url/url-parts';
import { SiteData } from '../types';
//  import Notice from 'calypso/components/notice';
//  import NoticeAction from 'calypso/components/notice/notice-action';
//  import getActiveDiscount from 'calypso/state/selectors/get-active-discount';
//  import { domainManagementList } from 'calypso/my-sites/domains/paths';
//  import {
// 	 hasDomainCredit,
// 	 isCurrentUserCurrentPlanOwner,
//  } from 'calypso/state/sites/plans/selectors';
//  import canCurrentUser from 'calypso/state/selectors/can-current-user';
//  import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
//  import isEligibleForFreeToPaidUpsell from 'calypso/state/selectors/is-eligible-for-free-to-paid-upsell';
//  import { recordTracksEvent } from 'calypso/state/analytics/actions';
//  import QuerySitePlans from 'calypso/components/data/query-site-plans';
//  import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
//  import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
//  import { getProductsList } from 'calypso/state/products-list/selectors';
//  import QueryProductsList from 'calypso/components/data/query-products-list';
//  import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
//  import { getUnformattedDomainPrice, getUnformattedDomainSalePrice } from 'calypso/lib/domains';
//  import formatCurrency from '@automattic/format-currency/src';
//  import { getPreference } from 'calypso/state/preferences/selectors';
//  import { isJetpackSite } from 'calypso/state/sites/selectors';
//  import { savePreference } from 'calypso/state/preferences/actions';
//  import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
//  import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
//  import { getSectionName } from 'calypso/state/ui/selectors';
//  import { getTopJITM } from 'calypso/state/jitm/selectors';
//  import AsyncLoad from 'calypso/components/async-load';
//  import UpsellNudge from 'calypso/blocks/upsell-nudge';
//  import { preventWidows } from 'calypso/lib/formatting';
//  import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

//  const DOMAIN_UPSELL_NUDGE_DISMISS_KEY = 'domain_upsell_nudge_dismiss'

interface Props {
	site: SiteData | null;
}

const getSiteRedirectNotice: FunctionComponent< Props > = ( { site } ) => {
	// 	 if ( ! site || this.props.isDomainOnly ) {
	// 		 return null;
	// 	 }

	if ( ! ( site?.options && site.options.is_redirect ) ) {
		return null;
	}
	const { hostname } = getUrlParts( site.URL );

	return <div>{ hostname }</div>;

	// 	 return (
	// 		 <Notice
	// 			 icon="info-outline"
	// 			 isCompact
	// 			 showDismiss={ false }
	// 			 text={ translate( 'Redirects to {{a}}%(url)s{{/a}}', {
	// 				 args: { url: hostname },
	// 				 components: { a: <a href={ site.URL } /> },
	// 			 } ) }
	// 		 >
	// 			 <NoticeAction href={ domainManagementList( site.domain ) }>
	// 				 { translate( 'Edit' ) }
	// 			 </NoticeAction>
	// 		 </Notice>
	// 	 );
};

const domainCreditNotice = () => {
	// 	 if ( ! this.props.hasDomainCredit || ! this.props.canManageOptions ) {
	// 		 return null;
	// 	 }
	// 	 if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
	// 		 return null;
	// 	 }
	// 	 const eventName = 'calypso_domain_credit_reminder_impression';
	// 	 const eventProperties = { cta_name: 'current_site_domain_notice' };
	// 	 const { translate } = this.props;
	// 	 const noticeText = preventWidows( translate( 'Free domain available' ) );
	// 	 const ctaText = translate( 'Claim' );
	// 	 return (
	// 		 <UpsellNudge
	// 			 callToAction={ ctaText }
	// 			 compact
	// 			 event={ eventName }
	// 			 forceHref={ true }
	// 			 forceDisplay={ true }
	// 			 href={ `/domains/add/${ this.props.site.slug }` }
	// 			 title={ noticeText }
	// 			 tracksClickName="calypso_domain_credit_reminder_click"
	// 			 tracksClickProperties={ eventProperties }
	// 			 tracksImpressionName={ eventName }
	// 			 tracksImpressionProperties={ eventProperties }
	// 		 />
	// 	 );
};

const domainUpsellNudge = () => {
	// 	 if ( ! this.props.isPlanOwner || this.props.domainUpsellNudgeDismissedDate ) {
	// 		 return null;
	// 	 }
	// 	 if ( this.props.isJetpack ) {
	// 		 return null;
	// 	 }
	// 	 if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
	// 		 return null;
	// 	 }
	// 	 const eligibleDomains = reject(
	// 		 this.props.domains,
	// 		 ( domain ) =>
	// 			 domain.isWPCOMDomain ||
	// 			 domain.name.endsWith( '.wpcomstaging.com' ) ||
	// 			 ( domain.registrationDate && moment( domain.registrationDate ).add( 7, 'days' ).isAfter() )
	// 	 );
	// 	 if ( eligibleDomains.length !== 1 ) {
	// 		 return null;
	// 	 }
	// 	 const { site, currencyCode, productsList, translate } = this.props;
	// 	 const priceAndSaleInfo = Object.entries( productsList ).reduce(
	// 		 function ( result, [ key, value ] ) {
	// 			 if ( value.is_domain_registration && value.available ) {
	// 				 const regularPrice = getUnformattedDomainPrice( key, productsList );
	// 				 const minRegularPrice = get( result, 'minRegularPrice', regularPrice );
	// 				 result.minRegularPrice = Math.min( minRegularPrice, regularPrice );
	// 				 const salePrice = getUnformattedDomainSalePrice( key, productsList );
	// 				 if ( salePrice ) {
	// 					 const minSalePrice = get( result, 'minSalePrice', salePrice );
	// 					 result.minSalePrice = Math.min( minSalePrice, salePrice );
	// 					 result.saleTlds.push( value.tld );
	// 				 }
	// 			 }
	// 			 return result;
	// 		 },
	// 		 { saleTlds: [] }
	// 	 );
	// 	 if ( ! priceAndSaleInfo.minSalePrice && ! priceAndSaleInfo.minRegularPrice ) {
	// 		 return null;
	// 	 }
	// 	 let noticeText;
	// 	 if ( priceAndSaleInfo.minSalePrice ) {
	// 		 if ( get( priceAndSaleInfo, 'saleTlds.length', 0 ) === 1 ) {
	// 			 noticeText = translate( 'Get a %(tld)s domain for just %(salePrice)s for a limited time', {
	// 				 args: {
	// 					 tld: priceAndSaleInfo.saleTlds[ 0 ],
	// 					 salePrice: formatCurrency( priceAndSaleInfo.minSalePrice, currencyCode ),
	// 				 },
	// 			 } );
	// 		 } else {
	// 			 noticeText = translate( 'Domains on sale starting at %(minSalePrice)s', {
	// 				 args: {
	// 					 minSalePrice: formatCurrency( priceAndSaleInfo.minSalePrice, currencyCode ),
	// 				 },
	// 			 } );
	// 		 }
	// 	 } else {
	// 		 noticeText = translate( 'Add another domain from %(minDomainPrice)s', {
	// 			 args: {
	// 				 minDomainPrice: formatCurrency( priceAndSaleInfo.minRegularPrice, currencyCode ),
	// 			 },
	// 		 } );
	// 	 }
	// 	 return (
	// 		 <UpsellNudge
	// 			 callToAction={ translate( 'Add' ) }
	// 			 compact
	// 			 href={ `/domains/add/${ site.slug }` }
	// 			 onDismissClick={ this.props.clickDomainUpsellDismiss }
	// 			 dismissPreferenceName="calypso_upgrade_nudge_cta_click"
	// 			 event="calypso_upgrade_nudge_impression"
	// 			 forceDisplay={ true }
	// 			 horizontal={ true }
	// 			 title={ preventWidows( noticeText ) }
	// 			 tracksClickName="calypso_upgrade_nudge_cta_click"
	// 			 tracksClickProperties={ { cta_name: 'domain-upsell-nudge' } }
	// 			 tracksImpressionName="calypso_upgrade_nudge_impression"
	// 			 tracksImpressionProperties={ { cta_name: 'domain-upsell-nudge' } }
	// 			 tracksDismissName="calypso_upgrade_nudge_cta_click"
	// 			 tracksDismissProperties={ { cta_name: 'domain-upsell-nudge-dismiss' } }
	// 		 />
	// 	 );
};

const promotionEndsToday = ( { endsAt }: { endsAt: Date } ) => {
	const now = new Date();
	const format = 'YYYYMMDD';
	return moment( now ).format( format ) === moment( endsAt ).format( format );
};

const activeDiscountNotice = () => {
	// 	 if ( ! this.props.activeDiscount ) {
	// 		 return null;
	// 	 }
	// 	 if ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
	// 		 return null;
	// 	 }
	// 	 const { site, activeDiscount } = this.props;
	// 	 const { nudgeText, nudgeEndsTodayText, ctaText, name } = activeDiscount;
	// 	 const bannerText =
	// 		 nudgeEndsTodayText && this.promotionEndsToday( activeDiscount )
	// 			 ? nudgeEndsTodayText
	// 			 : nudgeText;
	// 	 if ( ! bannerText ) {
	// 		 return null;
	// 	 }
	// 	 const eventProperties = { cta_name: 'active-discount-sidebar' };
	// 	 return (
	// 		 <UpsellNudge
	// 			 event="calypso_upgrade_nudge_impression"
	// 			 forceDisplay={ true }
	// 			 tracksClickName="calypso_upgrade_nudge_cta_click"
	// 			 tracksClickProperties={ eventProperties }
	// 			 tracksImpressionName="calypso_upgrade_nudge_impression"
	// 			 tracksImpressionProperties={ eventProperties }
	// 			 callToAction={ ctaText || 'Upgrade' }
	// 			 href={ `/plans/${ site.slug }?discount=${ name }` }
	// 			 title={ bannerText }
	// 		 />
	// 	 );
};

const SiteNotice: FunctionComponent< Props > = ( { site } ) => {
	// const { site, isMigrationInProgress, hasJITM } = this.props;
	// if ( ! site || isMigrationInProgress ) {
	// 	return <div className="current-site__notices" />;
	// }

	const discountOrFreeToPaid = activeDiscountNotice();

	// const showJitms =
	// 	! ( isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) &&
	// 	( discountOrFreeToPaid || config.isEnabled( 'jitms' ) );

	return (
		<div className="site__notices">
			{ /* <QueryProductsList /> */ }
			{ /* <QueryActivePromotions /> */ }
			{ getSiteRedirectNotice( site ) }
			{ /* { showJitms && (
				<AsyncLoad
					require="calypso/blocks/jitm"
					placeholder={ null }
					messagePath="calypso:sites:sidebar_notice"
					template="sidebar-banner"
				/>
			) } */ }
			{ /* <QuerySitePlans siteId={ site.ID } /> */ }
			{ /* { ! hasJITM && domainCreditNotice }
			{ ! ( hasJITM || discountOrFreeToPaid || domainCreditNotice ) && domainUpsellNudge() } */ }
		</div>
	);
};

export default SiteNotice;
