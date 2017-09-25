/**
 * External dependencies
 */
import { localize, moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainToPaidPlanNotice from './domain-to-paid-plan-notice';
import QuerySitePlans from 'components/data/query-site-plans';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import TrackComponentView from 'lib/analytics/track-component-view';
import paths from 'my-sites/domains/paths';
import { recordTracksEvent } from 'state/analytics/actions';
import { isStarted as isJetpackPluginsStarted, isFinished as isJetpackPluginsFinished } from 'state/plugins/premium/selectors';
import { canCurrentUser, isEligibleForFreeToPaidUpsell } from 'state/selectors';
import { isDomainOnlySite } from 'state/selectors';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import url from 'url';

class SiteNotice extends React.Component {
	static propTypes = {
		site: PropTypes.object
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
					components: { a: <a href={ site.URL } /> }
				} ) }
			>
				<NoticeAction href={ paths.domainManagementList( site.domain ) }>
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
			<Notice isCompact status="is-success" icon="info-outline" text={ translate( 'Free domain available' ) }>
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
		if ( ! this.props.isEligibleForFreeToPaidUpsell || '/plans' === this.props.allSitesPath ) {
			return null;
		}

		const eventName = 'calypso_upgrade_nudge_impression';
		const eventProperties = { cta_name: 'free-to-paid-sidebar' };
		const { translate } = this.props;

		return (
			<Notice isCompact status="is-success" icon="info-outline" text={ translate( 'Free domain with a plan' ) }>
				<NoticeAction
					onClick={ this.props.clickFreeToPaidPlanNotice }
					href={ `/plans/my-plan/${ this.props.site.slug }` }
				>
					{ translate( 'Upgrade' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	}

	jetpackPluginsSetupNotice() {
		if ( ! this.props.pausedJetpackPluginsSetup || this.props.site.plan.product_slug === 'jetpack_free' ) {
			return null;
		}

		const { translate } = this.props;

		return (
			<Notice
				icon="plugins"
				isCompact
				status="is-info"
				text={ translate(
					'Your %(plan)s plan needs setting up!',
					{ args: { plan: this.props.site.plan.product_name_short } }
				) }
			>
				<NoticeAction href={ `/plugins/setup/${ this.props.site.slug }` } >
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
				{ this.getSiteRedirectNotice( site ) }
				<QuerySitePlans siteId={ site.ID } />
				{ this.domainCreditNotice() }
				{ this.jetpackPluginsSetupNotice() }
				{ this.freeToPaidPlanNotice() }
				<DomainToPaidPlanNotice />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
	return {
		isDomainOnly: isDomainOnlySite( state, siteId ),
		isEligibleForFreeToPaidUpsell: isEligibleForFreeToPaidUpsell( state, siteId, moment() ),
		hasDomainCredit: hasDomainCredit( state, siteId ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		pausedJetpackPluginsSetup: isJetpackPluginsStarted( state, siteId ) && ! isJetpackPluginsFinished( state, siteId )
	};
}, ( dispatch ) => {
	return {
		clickClaimDomainNotice: () => dispatch( recordTracksEvent(
			'calypso_domain_credit_reminder_click', {
				cta_name: 'current_site_domain_notice'
			}
		) ),
		clickFreeToPaidPlanNotice: () => dispatch( recordTracksEvent(
			'calypso_upgrade_nudge_cta_click', {
				cta_name: 'free-to-paid-sidebar'
			}
		) ),
	};
} )( localize( SiteNotice ) );
