/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { connect } from 'react-redux';
import { compact, find, flow, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import areAllSitesSingleUser from 'calypso/state/selectors/are-all-sites-single-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite, isSingleUserSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getPostTypeLabel } from 'calypso/state/post-types/selectors';
import {
	getNormalizedMyPostCounts,
	getNormalizedPostCounts,
} from 'calypso/state/posts/counts/selectors';
import urlSearch from 'calypso/lib/url-search';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import Search from 'calypso/components/search';
import AuthorSegmented from './author-segmented';

/**
 * Internal dependencies
 */
import './style.scss';

export class PostTypeFilter extends Component {
	static displayName = 'PostTypeFilter';

	static propTypes = {
		authorToggleHidden: PropTypes.bool,
		siteId: PropTypes.number,
		query: PropTypes.shape( {
			author: PropTypes.number, // User ID
			status: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
		typeLabel: PropTypes.string,
		jetpack: PropTypes.bool,
		siteSlug: PropTypes.string,
		counts: PropTypes.object,
	};

	getNavItems() {
		const { query, siteId, siteSlug, statusSlug, jetpack, counts } = this.props;

		const isPostOrPage = query.type === 'post' || query.type === 'page';

		let basePath = '/types/' + query.type;
		if ( query.type === 'page' ) {
			basePath = '/pages';
		} else if ( query.type === 'post' ) {
			basePath = '/posts';
		}

		return reduce(
			counts,
			( memo, count, status ) => {
				let label;
				let pathStatus;
				switch ( status ) {
					case 'publish':
						label = this.props.translate( 'Published', {
							context: 'Filter label for posts list',
						} );
						break;

					case 'draft':
						label = this.props.translate( 'Drafts', {
							context: 'Filter label for posts list',
						} );
						pathStatus = 'drafts';
						break;

					case 'future':
						label = this.props.translate( 'Scheduled', {
							context: 'Filter label for posts list',
						} );
						pathStatus = 'scheduled';
						break;

					case 'trash':
						label = this.props.translate( 'Trashed', {
							context: 'Filter label for posts list',
						} );
						pathStatus = 'trashed';
						break;
				}

				return memo.concat( {
					key: `filter-${ status }`,
					// Hide count in all sites mode; and in Jetpack mode for non-posts
					count: ! siteId || ( jetpack && ! isPostOrPage ) ? null : count,
					path: compact( [
						basePath,
						isPostOrPage && query.author && 'my',
						pathStatus,
						siteSlug,
					] ).join( '/' ),
					selected: pathStatus === statusSlug,
					children: label,
				} );
			},
			[]
		);
	}

	render() {
		const {
			authorToggleHidden,
			jetpack,
			query,
			siteId,
			statusSlug,
			searchPagesPlaceholder,
		} = this.props;

		if ( ! query ) {
			return null;
		}

		const isSingleSite = !! siteId;

		const navItems = this.getNavItems();
		const sortOrder = [ 'filter-publish', 'filter-draft', 'filter-future', 'filter-trash' ];
		navItems.sort( ( a, b ) =>
			sortOrder.indexOf( a.key ) > sortOrder.indexOf( b.key ) ? 1 : -1
		);

		const selectedItem = find( navItems, 'selected' ) || {};

		const scopes = {
			me: this.props.translate( 'Me', { context: 'Filter label for posts list' } ),
			everyone: this.props.translate( 'Everyone', { context: 'Filter label for posts list' } ),
		};

		return (
			<div className="post-type-filter">
				{ siteId && false === jetpack && <QueryPostCounts siteId={ siteId } type={ query.type } /> }
				<SectionNav
					selectedText={
						<span>
							<span>{ selectedItem.children }</span>
							{ ! authorToggleHidden && (
								<small>{ query.author ? scopes.me : scopes.everyone }</small>
							) }
						</span>
					}
					selectedCount={ selectedItem.count }
				>
					<NavTabs
						label={ this.props.translate( 'Status', { context: 'Filter group label for tabs' } ) }
						selectedText={ selectedItem.children }
						selectedCount={ selectedItem.count }
					>
						{ navItems.map( ( props ) => (
							<NavItem { ...props } />
						) ) }
					</NavTabs>
					{ ! authorToggleHidden && (
						<AuthorSegmented
							author={ query.author }
							siteId={ siteId }
							statusSlug={ statusSlug }
							type={ query.type }
						/>
					) }
					{ /* Disable search in all-sites mode because it doesn't work. */ }
					{ isSingleSite && (
						<Search
							pinned
							fitsContainer
							initialValue={ query.search }
							isOpen={ this.props.getSearchOpen() }
							onSearch={ this.props.doSearch }
							placeholder={ `${ searchPagesPlaceholder }…` }
							delaySearch={ true }
						/>
					) }
				</SectionNav>
			</div>
		);
	}
}

export default flow(
	localize,
	urlSearch,
	connect( ( state, { query } ) => {
		const siteId = getSelectedSiteId( state );
		let authorToggleHidden = false;
		if ( query && ( query.type === 'post' || query.type === 'page' ) ) {
			if ( siteId ) {
				authorToggleHidden = isSingleUserSite( state, siteId ) || isJetpackSite( state, siteId );
			} else {
				authorToggleHidden = areAllSitesSingleUser( state );
			}
		} else {
			// Hide for Custom Post Types
			authorToggleHidden = true;
		}

		const props = {
			siteId,
			authorToggleHidden,
			jetpack: isJetpackSite( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
		};

		if ( ! query ) {
			return props;
		}

		const localeSlug = getLocaleSlug( state );
		const searchPagesPlaceholder = getPostTypeLabel(
			state,
			siteId,
			query.type,
			'search_items',
			localeSlug
		);

		return {
			...props,
			searchPagesPlaceholder,
			counts: query.author
				? getNormalizedMyPostCounts( state, siteId, query.type )
				: getNormalizedPostCounts( state, siteId, query.type ),
		};
	} )
)( PostTypeFilter );
