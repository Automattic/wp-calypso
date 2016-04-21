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

const SiteNotice = React.createClass( {
	propTypes: {
		site: React.PropTypes.object
	},

	getDefaultProps() {
		return {
		};
	},

	getSiteRedirectNotice: function( site ) {
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

		return (
			<Notice isCompact status="is-success" icon="info-outline">
				{ this.translate( 'Unused domain credit' ) }
				<NoticeAction
					onClick={ this.props.clickClaimDomainNotice }
					href={ `/domains/add/${ this.props.site.slug }` }
				>
					{ this.translate( 'Claim' ) }
				</NoticeAction>
			</Notice>
		);
	},

	render() {
		return (
			<div className="site__notices">
				{ this.getSiteRedirectNotice( this.props.site ) }
				{ this.domainCreditNotice() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		hasDomainCredit: hasDomainCredit( state, ownProps.site.ID )
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
