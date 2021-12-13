import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import AsyncLoad from 'calypso/components/async-load';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getTopJITM } from 'calypso/state/jitm/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getActiveDiscount from 'calypso/state/selectors/get-active-discount';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isEligibleForFreeToPaidUpsell from 'calypso/state/selectors/is-eligible-for-free-to-paid-upsell';
import isSiteMigrationActiveRoute from 'calypso/state/selectors/is-site-migration-active-route';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	hasDomainCredit,
	isCurrentUserCurrentPlanOwner,
} from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';

const DOMAIN_UPSELL_NUDGE_DISMISS_KEY = 'domain_upsell_nudge_dismiss';

export class SiteNotice extends Component {
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
		const { hostname } = getUrlParts( site.URL );
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

	activeDiscountNotice() {
		if ( ! this.props.activeDiscount ) {
			return null;
		}

		if ( this.props.isSiteWPForTeams ) {
			return null;
		}

		const { translate, site, activeDiscount } = this.props;
		const { nudgeText, nudgeEndsTodayText, ctaText, name } = activeDiscount;

		const bannerText =
			nudgeEndsTodayText && this.promotionEndsToday( activeDiscount )
				? nudgeEndsTodayText
				: nudgeText;

		if ( ! bannerText ) {
			return null;
		}

		const eventProperties = { cta_name: 'active-discount-sidebar' };
		return (
			<UpsellNudge
				event="calypso_upgrade_nudge_impression"
				forceDisplay
				tracksClickName="calypso_upgrade_nudge_cta_click"
				tracksClickProperties={ eventProperties }
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksImpressionProperties={ eventProperties }
				callToAction={ ctaText || translate( 'Upgrade' ) }
				href={ `/plans/${ site.slug }?discount=${ name }` }
				title={ bannerText }
			/>
		);
	}

	promotionEndsToday( { endsAt } ) {
		return moment().isSame( endsAt, 'day' );
	}

	render() {
		const { site, isMigrationInProgress } = this.props;
		if ( ! site || isMigrationInProgress ) {
			return <div className="current-site__notices" />;
		}

		const discountOrFreeToPaid = this.activeDiscountNotice();
		const siteRedirectNotice = this.getSiteRedirectNotice( site );

		const showJitms =
			! this.props.isSiteWPForTeams && ( discountOrFreeToPaid || config.isEnabled( 'jitms' ) );

		return (
			<div className="current-site__notices">
				<QueryProductsList />
				<QueryActivePromotions />
				{ siteRedirectNotice }
				{ showJitms && (
					<AsyncLoad
						require="calypso/blocks/jitm"
						placeholder={ null }
						messagePath="calypso:sites:sidebar_notice"
						template="sidebar-banner"
					/>
				) }
				<QuerySitePlans siteId={ site.ID } />
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
		const sectionName = getSectionName( state );
		const isMigrationInProgress =
			isSiteMigrationInProgress( state, siteId ) || isSiteMigrationActiveRoute( state );

		// Avoid passing `messagePath` as a prop to `SiteNotice` as it changes frequently and
		// thus will cause a lot of re-renders.
		const messagePath = `calypso:${ sectionName }:sidebar_notice`;

		return {
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isEligibleForFreeToPaidUpsell: isEligibleForFreeToPaidUpsell( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			activeDiscount: getActiveDiscount( state ),
			hasDomainCredit: hasDomainCredit( state, siteId ),
			canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			productsList: getProductsList( state ),
			domains: getDomainsBySiteId( state, siteId ),
			isPlanOwner: isCurrentUserCurrentPlanOwner( state, siteId ),
			currencyCode: getCurrentUserCurrencyCode( state ),
			domainUpsellNudgeDismissedDate: getPreference( state, DOMAIN_UPSELL_NUDGE_DISMISS_KEY ),
			isSiteWPForTeams: isSiteWPForTeams( state, siteId ),
			isMigrationInProgress,
			hasJITM: getTopJITM( state, messagePath ),
		};
	},
	( dispatch ) => {
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
			},
		};
	}
)( localize( SiteNotice ) );
