/**
 * External dependencies
 */
var React = require( 'react/addons' ),
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
	notices = require( 'notices' );

module.exports = React.createClass({

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
		var siteFilter = this.props.sites.selected ? '/' + this.props.sites.selected : '',
			statusSlug = this.props.status,
			searchPlaceholder, selectedText, filterStrings;

		filterStrings = {
			drafts: this.translate( 'Drafts', { context: 'Filter label for pages list' } ),
			published: this.translate( 'Published', { context: 'Filter label for pages list' } ),
			trashed: this.translate( 'Trash', { context: 'Filter label for pages list' } ),
			status: this.translate( 'Status' )
		};



		switch( statusSlug ) {
			case 'drafts':
				searchPlaceholder = this.translate( 'Search drafts…', { context: 'Search placeholder for pages list', textOnly: true } );
				selectedText = filterStrings.drafts;
				break;
			case 'trashed':
				searchPlaceholder = this.translate( 'Search trash…', { context: 'Search placeholder for pages list', textOnly: true } );
				selectedText = filterStrings.trashed;
				break;
			default:
				searchPlaceholder = this.translate( 'Search published…', { context: 'Search placeholder for pages list', textOnly: true } );
				selectedText = filterStrings.published;
				break;
		}

		return (
			<div className="main main-column pages" role="main">
				<SidebarNavigation />

				<SectionNav selectedText={ selectedText }>
					<NavTabs label={ filterStrings.status }>
						<NavItem path={ '/pages' + siteFilter } selected={ ! statusSlug }>{ filterStrings.published }</NavItem>
						<NavItem path={ '/pages/drafts' + siteFilter } selected={ statusSlug === 'drafts' } >{ filterStrings.drafts }</NavItem>
						<NavItem path={ '/pages/trashed' + siteFilter } selected={ statusSlug === 'trashed' } >{ filterStrings.trashed }</NavItem>
					</NavTabs>
					<Search
						pinned={ true }
						onSearch={ this.doSearch }
						initialValue={ this.props.search }
						placeholder={ searchPlaceholder }
						analyticsGroup="Pages"
						delaySearch={ true }
					/>
				</SectionNav>

				<PageList { ...this.props } />
			</div>
		);
	},

	_setWarning( selectedSite ) {
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			notices.warning(
				this.translate( 'Jetpack %(version)s is required to take full advantage of all page editing features.', { args: { version: config( 'jetpack_min_version' ) } } ),
				{ button: this.translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}
});
