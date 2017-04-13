/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import paths from 'my-sites/upgrades/paths';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import {
	canCurrentUser,
	eligibleForFreeToPaidUpsell,
} from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import {
	isStarted as isJetpackPluginsStarted,
	isFinished as isJetpackPluginsFinished
} from 'state/plugins/premium/selectors';
import TrackComponentView from 'lib/analytics/track-component-view';

const SiteNotice = React.createClass( {
	propTypes: {
		site: React.PropTypes.object
	},

	getDefaultProps() {
		return {
		};
	},

	getSiteRedirectNotice: function( site ) {
		if ( ! site ) {
			return null;
		}
		if ( ! ( site.options && site.options.is_redirect ) ) {
			return null;
		}
		const { hostname } = url.parse( site.URL );
		return (
			<Notice
				showDismiss={ false }
				icon="info-outline"
				isCompact
			>
				{ this.translate( 'Redirects to {{a}}%(url)s{{/a}}', {
					args: { url: hostname },
					components: { a: <a href={ site.URL }/> }
				} ) }
				<NoticeAction href={ paths.domainManagementList( site.domain ) }>
					{ this.translate( 'Edit' ) }
				</NoticeAction>
			</Notice>
		);
	},

	domainCreditNotice() {
		if ( ! this.props.hasDomainCredit || ! this.props.canManageOptions ) {
			return null;
		}

		const eventName = 'calypso_domain_credit_reminder_impression';
		const eventProperties = { cta_name: 'current_site_domain_notice' };
		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ this.translate( 'Free domain available' ) }
				<NoticeAction
					onClick={ this.props.clickClaimDomainNotice }
					href={ `/domains/add/${ this.props.site.slug }` }
				>
					{ this.translate( 'Claim' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	},

	freeToPaidPlanNotice() {
		if ( ! this.props.eligibleForFreeToPaidUpsell ) {
			return null;
		}
		const eventName = 'calypso_upgrade_nudge_impression';
		const eventProperties = { cta_name: 'free-to-paid-sidebar' };
		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ this.translate( 'Free domain with a plan' ) }
				<NoticeAction
					onClick={ this.props.clickFreeToPaidPlanNotice }
					href={ `/plans/my-plan/${ this.props.site.slug }` }
				>
					{ this.translate( 'Upgrade' ) }
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</NoticeAction>
			</Notice>
		);
	},

	jetpackPluginsSetupNotice() {
		if ( ! this.props.pausedJetpackPluginsSetup || this.props.site.plan.product_slug === 'jetpack_free' ) {
			return null;
		}

		return (
			<Notice isCompact status="is-info" icon="plugins">
				{ this.translate(
					'Your %(plan)s plan needs setting up!',
					{ args: { plan: this.props.site.plan.product_name_short } }
				) }
				<NoticeAction href={ `/plugins/setup/${ this.props.site.slug }` } >
					{ this.translate( 'Finish' ) }
				</NoticeAction>
			</Notice>
		);
	},

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
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
	return {
		eligibleForFreeToPaidUpsell: eligibleForFreeToPaidUpsell( state, siteId, i18n.moment() ),
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
} )( SiteNotice );
