/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import url from 'url';
import moment from 'moment';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import getActiveDiscount from 'state/selectors/get-active-discount';
import { domainManagementList } from 'my-sites/domains/paths';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isEligibleForFreeToPaidUpsell from 'state/selectors/is-eligible-for-free-to-paid-upsell';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import QueryActivePromotions from 'components/data/query-active-promotions';
import {
	isStarted as isJetpackPluginsStarted,
	isFinished as isJetpackPluginsFinished,
} from 'state/plugins/premium/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';
import DomainToPaidPlanNotice from './domain-to-paid-plan-notice';
import { abtest } from 'lib/abtest';
import config from 'config';

class SiteNotice extends React.Component {
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

	freeToPaidPlanNotice() {
		if ( ! this.props.isEligibleForFreeToPaidUpsell ) {
			return null;
		}

		const { site, translate } = this.props;
		let href = '/plans/' + site.slug;
		if (
			config.isEnabled( 'upsell/nudge-a-palooza' ) &&
			abtest( 'nudgeAPalooza' ) === 'plansBannerUpsells'
		) {
			href = href + '/?discount=free_domain';
		}

		return (
			<SidebarBanner
				ctaName="free-to-paid-sidebar"
				ctaText={ translate( 'Upgrade' ) }
				href={ href }
				icon="info-outline"
				text={ translate( 'Free domain with a plan' ) }
			/>
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

	jetpackPluginsSetupNotice() {
		if (
			! this.props.pausedJetpackPluginsSetup ||
			this.props.site.plan.product_slug === 'jetpack_free'
		) {
			return null;
		}

		const { translate } = this.props;

		return (
			<Notice
				icon="plugins"
				isCompact
				status="is-info"
				text={ translate( 'Your %(plan)s plan needs setting up!', {
					args: { plan: this.props.site.plan.product_name_short },
				} ) }
			>
				<NoticeAction href={ `/plugins/setup/${ this.props.site.slug }` }>
					{ translate( 'Finish' ) }
				</NoticeAction>
			</Notice>
		);
	}

	render() {
		const { site } = this.props;
		if ( ! site ) {
			return <div className="site__notices" />;
		}
		return (
			<div className="site__notices">
				<QueryActivePromotions />
				{ this.activeDiscountNotice() || this.freeToPaidPlanNotice() || <DomainToPaidPlanNotice /> }
				{ this.getSiteRedirectNotice( site ) }
				<QuerySitePlans siteId={ site.ID } />
				{ this.domainCreditNotice() }
				{ this.jetpackPluginsSetupNotice() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
		return {
			isDomainOnly: isDomainOnlySite( state, siteId ),
			isEligibleForFreeToPaidUpsell: isEligibleForFreeToPaidUpsell( state, siteId ),
			activeDiscount: getActiveDiscount( state ),
			hasDomainCredit: hasDomainCredit( state, siteId ),
			canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			pausedJetpackPluginsSetup:
				isJetpackPluginsStarted( state, siteId ) && ! isJetpackPluginsFinished( state, siteId ),
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
			clickFreeToPaidPlanNotice: () =>
				dispatch(
					recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
						cta_name: 'free-to-paid-sidebar',
					} )
				),
		};
	}
)( localize( SiteNotice ) );
