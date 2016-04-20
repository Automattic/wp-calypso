/**
 * External dependencies
 */
import React from 'react';
import url from 'url';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import paths from 'my-sites/upgrades/paths';

export default React.createClass( {
	displayName: 'SiteNotice',

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

	render() {
		return (
			<div className="site__notices">
				{ this.getSiteRedirectNotice( this.props.site ) }
				<Notice isCompact status="is-success" icon="info-outline">
					{ this.translate( 'Unused domain credit' ) }
					<NoticeAction>
						Claim
					</NoticeAction>
				</Notice>
			</div>
		);
	}
} );
