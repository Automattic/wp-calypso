/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import { find, includes, get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import UrlSearch from 'lib/mixins/url-search';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { localize } from 'i18n-calypso';
import { getSelectedSite } from 'state/ui/selectors';
import versionCompare from 'lib/version-compare';

const PeopleSearch = React.createClass( {
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

class PeopleNavTabs extends React.PureComponent {
	render() {
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
}

class PeopleSectionNav extends React.PureComponent {
	canSearch() {
		const { site, filter } = this.props;

		// Disable search for wpcom followers and viewers
		if ( filter ) {
			if ( 'followers' === filter || 'viewers' === filter ) {
				return false;
			}
		}

		if ( ! site.jetpack ) {
			// wpcom sites will always support search
			return true;
		}
		if ( 'team' === filter && versionCompare( site.options.jetpack_version, '3.7.0-beta' ) < 0 ) {
			// Jetpack sites can only search team on versions of 3.7.0-beta or later
			return false;
		}

		return true;
	}

	getFilters() {
		const { translate } = this.props,
			siteFilter = get( this.props, 'site.slug', '' ),
			filters = [
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
		const allowedFilterIds = [ 'team' ];
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
		const { site, filter } = this.props;
		if ( site && ( 'viewers' === filter || ( ! site.jetpack && site.is_private ) ) ) {
			return true;
		}
		return false;
	}

	render() {
		const { site } = this.props;

		let hasPinnedItems = false,
			search = null;

		if ( this.props.fetching ) {
			return <SectionNav></SectionNav>;
		}

		if ( site && this.canSearch() ) {
			hasPinnedItems = true;
			search = <PeopleSearch { ...this.props } />;
		}

		const selectedText = find( this.getFilters(), { id: this.props.filter } ).title;
		return (
			<SectionNav selectedText={ selectedText } hasPinnedItems={ hasPinnedItems }>
				<PeopleNavTabs { ...this.props } selectedText={ selectedText } filters={ this.getNavigableFilters() } />
				{ search }
			</SectionNav>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		site: getSelectedSite( state )
	};
};

export default localize( connect( mapStateToProps )( PeopleSectionNav ) );

