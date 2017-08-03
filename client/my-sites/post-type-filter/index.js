/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getNormalizedPostCounts } from 'state/posts/counts/selectors';
import { mapPostStatus } from 'lib/route/path';
import UrlSearch from 'lib/mixins/url-search';
import QueryPostCounts from 'components/data/query-post-counts';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

const PostTypeFilter = React.createClass( {
	mixins: [ UrlSearch ],

	propTypes: {
		siteId: PropTypes.number,
		query: PropTypes.object,
		jetpack: PropTypes.bool,
		siteSlug: PropTypes.string,
		counts: PropTypes.object
	},

	getDefaultProps() {
		return {
			query: {}
		};
	},

	getNavItems() {
		const { query, siteSlug, jetpack, counts } = this.props;

		return reduce( counts, ( memo, count, status ) => {
			if ( ! jetpack && ! count && ! includes( [ 'publish', 'draft' ], status ) ) {
				return memo;
			}

			let label, pathStatus;
			switch ( status ) {
				case 'publish':
					label = this.translate( 'Published', {
						context: 'Filter label for posts list'
					} );
					break;

				case 'draft':
					label = this.translate( 'Drafts', {
						context: 'Filter label for posts list'
					} );
					pathStatus = 'drafts';
					break;

				case 'future':
					label = this.translate( 'Scheduled', {
						context: 'Filter label for posts list'
					} );
					pathStatus = 'scheduled';
					break;

				case 'trash':
					label = this.translate( 'Trashed', {
						context: 'Filter label for posts list'
					} );
					pathStatus = 'trashed';
					break;
			}

			return memo.concat( {
				count: jetpack ? null : count,
				key: `filter-${ status }`,
				path: [
					'/types',
					query.type,
					pathStatus,
					siteSlug
				].filter( Boolean ).join( '/' ),
				selected: mapPostStatus( pathStatus ) === query.status,
				children: label
			} );
		}, [] );
	},

	render() {
		const { siteId, query, jetpack } = this.props;
		const navItems = this.getNavItems();
		const selectedItem = find( navItems, 'selected' ) || {};

		return (
			<div>
				{ query && siteId && false === jetpack && (
					<QueryPostCounts
						siteId={ siteId }
						type={ query.type } />
				) }
				<SectionNav
					selectedText={ selectedItem.children }
					selectedCount={ selectedItem.count }>
					{ query && [
						<NavTabs
							key="tabs"
							label={ this.translate( 'Status', { context: 'Filter group label for tabs' } ) }
							selectedText={ selectedItem.children }
							selectedCount={ selectedItem.count }>
							{ navItems.map( ( props ) => <NavItem { ...props } /> ) }
						</NavTabs>,
						<Search
							key="search"
							pinned
							fitsContainer
							onSearch={ this.doSearch }
							placeholder={ this.translate( 'Search…' ) }
							delaySearch={ true } />
					] }
				</SectionNav>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const props = {
		siteId,
		jetpack: isJetpackSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId )
	};

	if ( ! ownProps.query ) {
		return props;
	}

	return Object.assign( props, {
		counts: getNormalizedPostCounts( state, siteId, ownProps.query.type )
	} );
} )( PostTypeFilter );
