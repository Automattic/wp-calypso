/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import map from 'lodash/map';
import find from 'lodash/find';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getAllPostCounts } from 'state/posts/counts/selectors';
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
		counts: PropTypes.object
	},

	getDefaultProps() {
		return {
			query: {}
		};
	},

	getNavItems() {
		const { query, siteSlug, counts } = this.props;

		return map( counts, ( count, status ) => {
			if ( ! count && ! includes( [ 'publish', 'draft' ], status ) ) {
				return;
			}

			let label;
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
					break;

				case 'pending':
					label = this.translate( 'Pending', {
						context: 'Filter label for posts list'
					} );
					break;

				case 'private':
					label = this.translate( 'Private', {
						context: 'Filter label for posts list'
					} );
					break;

				case 'future':
					label = this.translate( 'Scheduled', {
						context: 'Filter label for posts list'
					} );
					break;

				case 'trash':
					label = this.translate( 'Trashed', {
						context: 'Filter label for posts list'
					} );
					break;
			}

			let pathStatus;
			if ( 'publish' !== status ) {
				pathStatus = status;
			}

			return {
				count,
				key: `filter-${ status }`,
				path: [
					'/types',
					query.type,
					pathStatus,
					siteSlug
				].filter( Boolean ).join( '/' ),
				selected: query.status === status,
				children: label
			};
		} ).filter( Boolean );
	},

	render() {
		const { siteId, query, counts } = this.props;
		const navItems = this.getNavItems();
		const selectedItem = find( navItems, 'selected' ) || {};

		return (
			<div>
				{ siteId && (
					<QueryPostCounts
						siteId={ siteId }
						type={ query.type } />
				) }
				<SectionNav
					selectedText={ selectedItem.children }
					selectedCount={ selectedItem.count }>
					{ counts && [
						<NavTabs
							key="tabs"
							label={ this.translate( 'Status', { context: 'Filter group label for tabs' } ) }
							selectedText={ selectedItem.children }
							selectedCount={ selectedItem.count }>
							{ map( navItems, ( props ) => <NavItem { ...props } /> ) }
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
		siteSlug: getSiteSlug( state, siteId )
	};

	if ( ! ownProps.query ) {
		return props;
	}

	return Object.assign( props, {
		counts: getAllPostCounts( state, siteId, ownProps.query.type )
	} );
} )( PostTypeFilter );
