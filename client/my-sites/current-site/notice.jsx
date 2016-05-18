/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import paths from 'my-sites/upgrades/paths';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import { abtest } from 'lib/abtest';
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
		if ( ! this.props.hasDomainCredit ) {
			return null;
		}

		if ( abtest( 'domainCreditsInfoNotice' ) === 'showNotice' ) {
			const eventName = 'calypso_domain_credit_reminder_impression';
			const eventProperties = { cta_name: 'current_site_domain_notice' };
			return (
				<Notice isCompact status="is-success" icon="info-outline">
					{ this.translate( 'Unused domain credit' ) }
					<NoticeAction
						onClick={ this.props.clickClaimDomainNotice }
						href={ `/domains/add/${ this.props.site.slug }` }
					>
						{ this.translate( 'Claim' ) }
						<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
					</NoticeAction>
				</Notice>
			);
		}

		//otherwise still track what happens when we don't show a notice
		const eventName = 'calypso_domain_credit_reminder_no_impression';
		const eventProperties = { cta_name: 'current_site_domain_notice' };
		return (
			<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
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
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		hasDomainCredit: !! ownProps.site && hasDomainCredit( state, ownProps.site.ID )
	};
}, ( dispatch ) => {
	return {
		clickClaimDomainNotice: () => dispatch( recordTracksEvent(
			'calypso_domain_credit_reminder_click', {
				cta_name: 'current_site_domain_notice'
			}
		) )
	};
} )( SiteNotice );
