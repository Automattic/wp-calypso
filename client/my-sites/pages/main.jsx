/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PageList from './page-list';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import observe from 'lib/mixins/data-observe';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import URLSearch from 'lib/mixins/url-search';
import config from 'config';
import Main from 'components/main';

import { warningNotice } from 'state/notices/actions';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

const statuses = [ 'published', 'drafts', 'scheduled', 'trashed' ];

const PagesMain = React.createClass( {

	displayName: 'Pages',

	mixins: [ observe( 'sites' ), URLSearch ],

	propTypes: {
		trackScrollPage: React.PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			perPage: 20
		};
	},

	componentWillMount: function() {
		this._setWarning( this.props.selectedSite );
	},

	componentWillReceiveProps: function( nextProps ) {
		this._setWarning( nextProps.selectedSite );
	},

	render: function() {
		const status = this.props.status || 'published';
		const { translate } = this.props;
		const filterStrings = {
			published: translate( 'Published', { context: 'Filter label for pages list' } ),
			drafts: translate( 'Drafts', { context: 'Filter label for pages list' } ),
			scheduled: translate( 'Scheduled', { context: 'Filter label for pages list' } ),
			trashed: translate( 'Trashed', { context: 'Filter label for pages list' } )
		};
		const searchStrings = {
			published: translate( 'Search Published…', { context: 'Search placeholder for pages list', textOnly: true } ),
			drafts: translate( 'Search Drafts…', { context: 'Search placeholder for pages list', textOnly: true } ),
			scheduled: translate( 'Search Scheduled…', { context: 'Search placeholder for pages list', textOnly: true } ),
			trashed: translate( 'Search Trashed…', { context: 'Search placeholder for pages list', textOnly: true } )
		};
		return (
			<Main classname="pages">
				<SidebarNavigation />
				<SectionNav selectedText={ filterStrings[ status ] }>
					<NavTabs label={ translate( 'Status', { context: 'Filter page group label for tabs' } ) }>
						{ this.getNavItems( filterStrings, status ) }
					</NavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.doSearch }
						initialValue={ this.props.search }
						placeholder={ searchStrings[ status ] }
						analyticsGroup="Pages"
						delaySearch={ true }
					/>
				</SectionNav>
				<PageList { ...this.props } />
			</Main>
		);
	},

	getNavItems( filterStrings, currentStatus ) {
		const siteFilter = this.props.sites.selected ? '/' + this.props.sites.selected : '';
		return statuses.map( function( status ) {
			let path = `/pages${ siteFilter }`;
			if ( status !== 'publish' ) {
				path = `/pages/${ status }${ siteFilter }`;
			}
			return (
				<NavItem
					path={ path }
					selected={ currentStatus === status }
					key={ `page-filter-${ status }` }>
					{ filterStrings[ status ] }
				</NavItem>
			);
		} );
	},

	_setWarning( selectedSite ) {
		const { translate, displayWarningNotice } = this.props;
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			displayWarningNotice(
				translate(
					'Jetpack %(version)s is required to take full advantage of all page editing features.',
					{ args: { version: config( 'jetpack_min_version' ) } }
				),
				{ button: translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}
} );

export default connect(
	( state ) => {
		return {
			siteID: getSelectedSiteId( state ),
			selectedSite: getSelectedSite( state ),
		};
	},
	{
		displayWarningNotice: warningNotice,
	},
)( localize( PagesMain ) );
