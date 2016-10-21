/**
 * External dependencies
 */
var React = require( 'react' ),
	config = require( 'config' ),
	find = require( 'lodash/find' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
var Search = require( 'components/search' ),
	UrlSearch = require( 'lib/mixins/url-search' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' );

let PeopleSearch = React.createClass( {
	displayName: 'PeopleSearch',
	mixins: [ UrlSearch ],

	render: function() {
		return (
			<Search
				pinned
				fitsContainer
				onSearch={ this.doSearch }
				initialValue={ this.props.search }
				ref="url-search"
				delaySearch={ true }
				analyticsGroup="People" />
		);
	}
} );

let PeopleNavTabs = React.createClass( {
	displayName: 'PeopleNavTabs',
	render: function() {
		return (
			<NavTabs selectedText={ this.props.selectedText }>
				{ this.props.filters.map( function( filterItem ) {
					return (
						<NavItem
							key={ filterItem.id }
							path={ filterItem.path }
							selected={ filterItem.id === this.props.filter } >
							{ filterItem.title }
						</NavItem>
					);
				}, this ) }
			</NavTabs>
		);
	}
} );

module.exports = React.createClass( {

	displayName: 'PeopleSectionNav',

	canSearch: function() {
		// Disable search for wpcom followers and viewers
		if ( this.props.filter ) {
			if ( 'followers' === this.props.filter || 'viewers' === this.props.filter ) {
				return false;
			}
		}

		if ( ! this.props.site.jetpack ) {
			// wpcom sites will always support search
			return true;
		}

		if ( 'team' === this.props.filter && ! this.props.site.versionCompare( '3.7.0-beta', '>=' ) ) {
			// Jetpack sites can only search team on versions of 3.7.0-beta or later
			return false;
		}

		return true;
	},

	getFilters: function() {
		var siteFilter = this.props.site.slug,
			filters = [
				{
					title: this.translate( 'Team', { context: 'Filter label for people list' } ),
					path: '/people/team/' + siteFilter,
					id: 'team'
				},
				{
					title: this.translate( 'Administrators', { context: 'Filter label for people list' } ),
					path: '/people/team/administrators/' + siteFilter,
					id: 'administrators'
				},
				{
					title: this.translate( 'Editors', { context: 'Filter label for people list' } ),
					path: '/people/team/editors/' + siteFilter,
					id: 'editors'
				},
				{
					title: this.translate( 'Authors', { context: 'Filter label for people list' } ),
					path: '/people/team/authors/' + siteFilter,
					id: 'authors'
				},
				{
					title: this.translate( 'Contributors', { context: 'Filter label for people list' } ),
					path: '/people/team/contributors/' + siteFilter,
					id: 'contributors'
				},
				{
					title: this.translate( 'Followers', { context: 'Filter label for people list' } ),
					path: '/people/followers/' + siteFilter,
					id: 'followers'
				},
				{
					title: this.translate( 'Email Followers', { context: 'Filter label for people list' } ),
					path: '/people/email-followers/' + siteFilter,
					id: 'email-followers'
				},
				{
					title: this.translate( 'Viewers', { context: 'Filter label for people list' } ),
					path: '/people/viewers/' + siteFilter,
					id: 'viewers'
				}
			];

		return filters;
	},

	getNavigableFilters: function() {
		var allowedFilterIds = [ 'team' ];

		if ( config.isEnabled( 'manage/people/role-filtering' ) ) {
			[ 'administrators', 'editors', 'authors', 'contributors' ].forEach( function( filter ) {
				allowedFilterIds.push( filter );
			} )
		}

		if ( config.isEnabled( 'manage/people/readers' ) ) {
			allowedFilterIds.push( 'followers' );
			allowedFilterIds.push( 'email-followers' );

			if ( this.shouldDisplayViewers() ) {
				allowedFilterIds.push( 'viewers' );
			}
		}

		return this.getFilters().filter( filter => this.props.filter === filter.id || includes( allowedFilterIds, filter.id ) );
	},

	shouldDisplayViewers: function() {
		if ( 'viewers' === this.props.filter || ( ! this.props.site.jetpack && this.props.site.is_private ) ) {
			return true;
		}
		return false;
	},

	render: function() {
		var selectedText,
			hasPinnedItems = false,
			search = null;

		if ( this.props.fetching ) {
			return <SectionNav></SectionNav>
		}

		if ( this.canSearch() ) {
			hasPinnedItems = true;
			search = <PeopleSearch { ...this.props } />;
		}

		selectedText = find( this.getFilters(), { id: this.props.filter } ).title;
		return (
			<SectionNav selectedText={ selectedText } hasPinnedItems={ hasPinnedItems }>
				<PeopleNavTabs { ...this.props } selectedText={ selectedText } filters={ this.getNavigableFilters() } />
				{ search }
			</SectionNav>
		);
	}
} );
