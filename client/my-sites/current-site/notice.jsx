/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import url from 'url';
import moment from 'moment';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import config from 'config';
import { get, reject, transform } from 'lodash';

/**
 * Internal dependencies
 */
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import getActiveDiscount from 'state/selectors/get-active-discount';
import { domainManagementList } from 'my-sites/domains/paths';
import { hasDomainCredit, isCurrentUserCurrentPlanOwner } from 'state/sites/plans/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isEligibleForFreeToPaidUpsell from 'state/selectors/is-eligible-for-free-to-paid-upsell';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import CartData from 'components/data/cart';
import TrackComponentView from 'lib/analytics/track-component-view';
import PendingPaymentNotice from './pending-payment-notice';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import { getProductsList } from 'state/products-list/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getUnformattedDomainPrice, getUnformattedDomainSalePrice } from 'lib/domains';
import formatCurrency from '@automattic/format-currency/src';
import { getPreference } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import isSiteMigrationInProgress from 'state/selectors/is-site-migration-in-progress';
import { getSectionName } from 'state/ui/selectors';
import { getTopJITM } from 'state/jitm/selectors';
import AsyncLoad from 'components/async-load';

const DOMAIN_UPSELL_NUDGE_DISMISS_KEY = 'domain_upsell_nudge_dismiss';

export class SiteNotice extends React.Component {
	static propTypes = {
		site: PropTypes.object,
	};

	static defaultProps = {};

	getSiteRedirectNotice( site ) {
		if ( ! site || this.props.isDomainOnly ) {
			return null;
		}
		if ( ! ( site.options && site.options.is_redirect ) ) {
			return null;
		}
		const { hostname } = url.parse( site.URL );
		const { translate } = this.props;

		return (
			<Notice
				icon="info-outline"
				isCompact
				showDismiss={ false }
				text={ translate( 'Redirects to {{a}}%(url)s{{/a}}', {
					args: { url: hostname },
					components: { a: <a href={ site.URL } /> },
				} ) }
			>
				<NoticeAction href={ domainManagementList( site.domain ) }>
					{ translate( 'Edit' ) }
				</NoticeAction>
			</Notice>
		);
	}

	domainCreditNotice() {
		if ( ! this.props.hasDomainCredit || ! this.props.canManageOptions ) {
			return null;
		}

		const eventName = 'calypso_domain_credit_reminder_impression';
		const eventProperties = { cta_name: 'current_site_domain_notice' };
		const { translate } = this.props;

		return (
			<Notice
				isCompact
				status="is-success"
				icon="info-outline"
				text={ translate( 'Free domain available' ) }
			>
				<NoticeAction
					onClick={ this.props.clickClaimDomainNotice }
					href={ `/domains/add/${ this.props.site.slug }` }
				>
					{ translate( 'Claim' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	}

	domainUpsellNudge() {
		if ( ! this.props.isPlanOwner || this.props.domainUpsellNudgeDismissedDate ) {
			return null;
		}

		const eligibleDomains = reject(
			this.props.domains,
			domain =>
				domain.isWPCOMDomain ||
				domain.name.endsWith( '.wpcomstaging.com' ) ||
				( domain.registrationDate &&
					moment( domain.registrationDate )
						.add( 7, 'days' )
						.isAfter() )
		);

		if ( eligibleDomains.length !== 1 ) {
			return null;
		}

		const { site, currencyCode, productsList, translate } = this.props;

		const priceAndSaleInfo = transform(
			productsList,
			function( result, value, key ) {
				if ( value.is_domain_registration && value.available ) {
					const regularPrice = getUnformattedDomainPrice( key, productsList );
					const minRegularPrice = get( result, 'minRegularPrice', regularPrice );
					result.minRegularPrice = Math.min( minRegularPrice, regularPrice );

					const salePrice = getUnformattedDomainSalePrice( key, productsList );
					if ( salePrice ) {
						const minSalePrice = get( result, 'minSalePrice', salePrice );
						result.minSalePrice = Math.min( minSalePrice, salePrice );
						result.saleTlds.push( value.tld );
					}
				}
			},
			{ saleTlds: [] }
		);

		if ( ! priceAndSaleInfo.minSalePrice && ! priceAndSaleInfo.minRegularPrice ) {
			return null;
		}

		let noticeText;

		if ( priceAndSaleInfo.minSalePrice ) {
			if ( get( priceAndSaleInfo, 'saleTlds.length', 0 ) === 1 ) {
				noticeText = translate( 'Get a %(tld)s domain for just %(salePrice)s for a limited time', {
					args: {
						tld: priceAndSaleInfo.saleTlds[ 0 ],
						salePrice: formatCurrency( priceAndSaleInfo.minSalePrice, currencyCode ),
					},
				} );
			} else {
				noticeText = translate( 'Domains on sale starting at %(minSalePrice)s', {
					args: {
						minSalePrice: formatCurrency( priceAndSaleInfo.minSalePrice, currencyCode ),
					},
				} );
			}
		} else {
			noticeText = translate( 'Add another domain from %(minDomainPrice)s', {
				args: {
					minDomainPrice: formatCurrency( priceAndSaleInfo.minRegularPrice, currencyCode ),
				},
			} );
		}

		return (
			<Notice
				isCompact
				status="is-success"
				icon="info-outline"
				onDismissClick={ this.props.clickDomainUpsellDismiss }
				showDismiss={ true }
			>
				<NoticeAction
					onClick={ this.props.clickDomainUpsellGo }
					href={ `/domains/add/${ site.slug }` }
				>
					{ noticeText }
					<TrackComponentView
						eventName="calypso_upgrade_nudge_impression"
						eventProperties={ { cta_name: 'domain-upsell-nudge' } }
					/>
				</NoticeAction>
			</Notice>
		);
	}

	activeDiscountNotice() {
		if ( ! this.props.activeDiscount ) {
			return null;
		}

		const { site, activeDiscount } = this.props;
		const { nudgeText, nudgeEndsTodayText, ctaText, name } = activeDiscount;

		const bannerText =
			nudgeEndsTodayText && this.promotionEndsToday( activeDiscount )
				? nudgeEndsTodayText
				: nudgeText;

		if ( ! bannerText ) {
			return null;
		}

		return (
			<SidebarBanner
				ctaName="active-discount-sidebar"
				ctaText={ ctaText || 'Upgrade' }
				href={ `/plans/${ site.slug }?discount=${ name }` }
				icon="info-outline"
				text={ bannerText }
			/>
		);
	}

	promotionEndsToday( { endsAt } ) {
		const now = new Date();
		const format = 'YYYYMMDD';
		return moment( now ).format( format ) === moment( endsAt ).format( format );
	}

	pendingPaymentNotice() {
		if ( ! config.isEnabled( 'async-payments' ) ) {
			return null;
		}

		return (
			<CartData>
				<PendingPaymentNotice />
			</CartData>
		);
	}

	render() {
		const { site, isMigrationInProgress, messagePath, hasJITM } = this.props;
		if ( ! site || isMigrationInProgress ) {
			return <div className="current-site__notices" />;
		}

		const discountOrFreeToPaid = this.activeDiscountNotice();
		const siteRedirectNotice = this.getSiteRedirectNotice( site );
		const domainCreditNotice = this.domainCreditNotice();

		return (
			<div className="current-site__notices">
				<QueryProductsList />
				<QueryActivePromotions />
				{ discountOrFreeToPaid ||
					( config.isEnabled( 'jitms' ) && (
						<AsyncLoad
							require="blocks/jitm"
							messagePath={ messagePath }
							template="sidebar-banner"
						/>
					) ) }
				{ siteRedirectNotice }
				<QuerySitePlans siteId={ site.ID } />
				{ this.pendingPaymentNotice() }
				{ ! hasJITM && domainCreditNotice }
				{ ! ( hasJITM || discountOrFreeToPaid || domainCreditNotice ) && this.domainUpsellNudge() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
		const sectionName = getSectionName( state );
		const messagePath = `calypso:${ sectionName }:sidebar_notice`;

		return {
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isEligibleForFreeToPaidUpsell: isEligibleForFreeToPaidUpsell( state, siteId ),
			activeDiscount: getActiveDiscount( state ),
			hasDomainCredit: hasDomainCredit( state, siteId ),
			canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			productsList: getProductsList( state ),
			domains: getDomainsBySiteId( state, siteId ),
			isPlanOwner: isCurrentUserCurrentPlanOwner( state, siteId ),
			currencyCode: getCurrentUserCurrencyCode( state ),
			domainUpsellNudgeDismissedDate: getPreference( state, DOMAIN_UPSELL_NUDGE_DISMISS_KEY ),
			isMigrationInProgress: !! isSiteMigrationInProgress( state, siteId ),
			hasJITM: getTopJITM( state, messagePath ),
			messagePath,
		};
	},
	dispatch => {
		return {
			clickClaimDomainNotice: () =>
				dispatch(
					recordTracksEvent( 'calypso_domain_credit_reminder_click', {
						cta_name: 'current_site_domain_notice',
					} )
				),
			clickDomainUpsellGo: () =>
				dispatch(
					recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
						cta_name: 'domain-upsell-nudge',
					} )
				),
			clickDomainUpsellDismiss: () => {
				dispatch( savePreference( DOMAIN_UPSELL_NUDGE_DISMISS_KEY, new Date().toISOString() ) );
				dispatch(
					recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
						cta_name: 'domain-upsell-nudge-dismiss',
					} )
				);
			},
		};
	}
)( localize( SiteNotice ) );
