/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:pages:pages' );

/**
 * Internal dependencies
 */
var PageList = require( './page-list' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	Search = require( 'components/search' ),
	observe = require( 'lib/mixins/data-observe' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	URLSearch = require( 'lib/mixins/url-search' ),
	config = require( 'config' ),
	notices = require( 'notices' ),
	Main = require( 'components/main' ),
	PagesFirstView = require( './first-view' );

const statuses = [ 'published', 'drafts', 'scheduled', 'trashed' ];

module.exports = React.createClass( {

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
		var selectedSite = this.props.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	componentDidMount: function() {
		debug( 'Pages React component mounted.' );
	},

	componentWillReceiveProps: function( nextProps ) {
		var selectedSite = nextProps.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	render: function() {
		const status = this.props.status || 'published';
		const filterStrings = {
			published: this.translate( 'Published', { context: 'Filter label for pages list' } ),
			drafts: this.translate( 'Drafts', { context: 'Filter label for pages list' } ),
			scheduled: this.translate( 'Scheduled', { context: 'Filter label for pages list' } ),
			trashed: this.translate( 'Trashed', { context: 'Filter label for pages list' } )
		};
		const searchStrings = {
			published: this.translate( 'Search Published…', { context: 'Search placeholder for pages list', textOnly: true } ),
			drafts: this.translate( 'Search Drafts…', { context: 'Search placeholder for pages list', textOnly: true } ),
			scheduled: this.translate( 'Search Scheduled…', { context: 'Search placeholder for pages list', textOnly: true } ),
			trashed: this.translate( 'Search Trashed…', { context: 'Search placeholder for pages list', textOnly: true } )
		};
		return (
			<Main classname="pages">
				<PagesFirstView />
				<SidebarNavigation />
				<SectionNav selectedText={ filterStrings[ status ] }>
					<NavTabs label={ this.translate( 'Status', { context: 'Filter page group label for tabs' } ) }>
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
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			notices.warning(
				this.translate( 'Jetpack %(version)s is required to take full advantage of all page editing features.', { args: { version: config( 'jetpack_min_version' ) } } ),
				{ button: this.translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}
} );
