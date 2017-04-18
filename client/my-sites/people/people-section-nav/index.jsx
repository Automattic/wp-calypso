/**
 * External dependencies
 */
import React, { Component } from 'react';
import config from 'config';
import { find, get, includes } from 'lodash';
import { localize } from 'i18n-calypso';

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

class PeopleSectionNav extends Component {

	canSearch() {
		const { isJetpack, jetpackPeopleSupported, filter } = this.props;
		if ( ! this.props.site ) {
			return false;
		}

		// Disable search for wpcom followers and viewers
		if ( filter ) {
			if ( 'followers' === filter || 'viewers' === filter ) {
				return false;
			}
		}

		if ( ! isJetpack ) {
			// wpcom sites will always support search
			return true;
		}

		if ( 'team' === filter && ! jetpackPeopleSupported ) {
			// Jetpack sites can only search team on versions of 3.7.0-beta or later
			return false;
		}

		return true;
	}

	getFilters() {
		const siteFilter = get( this.props.site, 'slug', '' );
		const { translate } = this.props;
		const filters = [
			{
				title: translate( 'Team', { context: 'Filter label for people list' } ),
				path: '/people/team/' + siteFilter,
				id: 'team'
			},
			{
				title: translate( 'Followers', { context: 'Filter label for people list' } ),
				path: '/people/followers/' + siteFilter,
				id: 'followers'
			},
			{
				title: translate( 'Email Followers', { context: 'Filter label for people list' } ),
				path: '/people/email-followers/' + siteFilter,
				id: 'email-followers'
			},
			{
				title: translate( 'Viewers', { context: 'Filter label for people list' } ),
				path: '/people/viewers/' + siteFilter,
				id: 'viewers'
			}
		];

		return filters;
	}

	getNavigableFilters() {
		var allowedFilterIds = [ 'team' ];
		if ( config.isEnabled( 'manage/people/readers' ) ) {
			allowedFilterIds.push( 'followers' );
			allowedFilterIds.push( 'email-followers' );

			if ( this.shouldDisplayViewers() ) {
				allowedFilterIds.push( 'viewers' );
			}
		}

		return this.getFilters().filter( filter => this.props.filter === filter.id || includes( allowedFilterIds, filter.id ) );
	}

	shouldDisplayViewers() {
		if ( ! this.props.site ) {
			return false;
		}

		if ( 'viewers' === this.props.filter || ( ! this.props.isJetpack && this.props.isPrivate ) ) {
			return true;
		}
		return false;
	}

	render() {
		var selectedText,
			hasPinnedItems = false,
			search = null;

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
}

export default localize( PeopleSectionNav );
