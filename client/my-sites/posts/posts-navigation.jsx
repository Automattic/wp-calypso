/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import omit from 'lodash/omit';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getAllPostCounts, getMyPostCounts } from 'state/posts/counts/selectors';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import QueryPostCounts from 'components/data/query-post-counts';
import URLSearch from 'lib/mixins/url-search';

/**
 * Path converter
 */

const statusToDescription = {
	publish: 'published',
	draft: 'drafts',
	future: 'scheduled',
	trash: 'trashed'
};

/**
 * Given an object mapping post statuses to count, returns a new object with
 * pending and private counts summed with draft and publish respectively.
 *
 * @param  {Object} counts Mapping of post status to count
 * @return {Object}        Updated mapping with pending and private merged
 */
function getConsolidatedCounts( counts ) {
	if ( ! counts ) {
		return;
	}

	const consolidatedCounts = Object.assign( {}, counts, {
		draft: counts.draft + counts.pending,
		publish: counts.publish + counts.private
	} );

	return omit( consolidatedCounts, 'pending', 'private' );
}

const PostsNavigation = React.createClass( {
	propTypes: {
		context: React.PropTypes.object.isRequired,
		sites: React.PropTypes.object.isRequired,
		author: React.PropTypes.number,
		statusSlug: React.PropTypes.string,
		search: React.PropTypes.string,
		siteId: React.PropTypes.number,
		jetpackSite: React.PropTypes.bool,
		counts: React.PropTypes.object
	},

	mixins: [ URLSearch ],

	render() {
		let author = this.props.author ? '/my' : '',
			statusSlug = this.props.statusSlug ? '/' + this.props.statusSlug : '',
			siteFilter = this.props.sites.selected ? '/' + this.props.sites.selected : '',
			selectedSite = this.props.sites.getSelectedSite(),
			showMyFilter = true;

		this.filterStatuses = {
			publish: this.translate( 'Published', { context: 'Filter label for posts list' } ),
			draft: this.translate( 'Drafts', { context: 'Filter label for posts list' } ),
			future: this.translate( 'Scheduled', { context: 'Filter label for posts list' } ),
			trash: this.translate( 'Trashed', { context: 'Filter label for posts list' } )
		};

		this.filterScope = {
			me: this.translate( 'Only Me', { context: 'Filter label for posts list' } ),
			everyone: this.translate( 'Everyone', { context: 'Filter label for posts list' } )
		};

		this.strings = {
			status: this.translate( 'Status', { context: 'Filter group label for tabs' } ),
			author: this.translate( 'Author', { context: 'Filter group label for segmented' } ),
		};

		let statusTabs = this._getStatusTabs( author, siteFilter );
		let authorSegmented = this._getAuthorSegmented( statusSlug, siteFilter );

		if ( this.props.sites.selected ) {
			if ( selectedSite.single_user_site || selectedSite.jetpack ) {
				showMyFilter = false;
			}
		} else if ( this.props.sites.allSingleSites ) {
			showMyFilter = false;
		}

		let mobileHeaderText = this._getMobileHeaderText(
			showMyFilter, statusTabs.selectedText, authorSegmented.selectedText
		);

		return (
			<div>
				{ this.props.siteId && false === this.props.jetpackSite && (
					<QueryPostCounts
						siteId={ this.props.siteId }
						type="post" />
				) }
				<SectionNav selectedText={ mobileHeaderText }>
					{ statusTabs.element }
					{ ( showMyFilter ) ?
						authorSegmented.element : null
					}
					<Search
						pinned={ true }
						onSearch={ this.doSearch }
						initialValue={ this.props.search }
						placeholder={ 'Search ' + statusTabs.selectedText + '...' }
						analyticsGroup="Posts"
						delaySearch={ true } />
				</SectionNav>
			</div>
		);
	},

	_getStatusTabs( author, siteFilter ) {
		const statusItems = [];
		let selectedText, selectedCount;

		for ( let status in this.filterStatuses ) {
			const count = this.getCountByStatus( status );
			if ( ! count && this.props.siteId && ! this.props.jetpackSite &&
					! includes( [ 'publish', 'draft' ], status ) ) {
				continue;
			}

			let path = '/posts' + author +
				( 'publish' === status ? '' : '/' + statusToDescription[ status ] ) +
				siteFilter;

			let textItem = this.filterStatuses[ status ];

			if ( path === this.props.context.pathname ) {
				selectedText = textItem;

				if ( ! this.props.jetpackSite ) {
					selectedCount = count;
				}
			}

			statusItems.push(
				<NavItem
					key={ 'statusTabs' + path }
					path={ path }
					count={ count }
					value={ textItem }
					selected={ path === this.props.context.pathname }>
					{ textItem }
				</NavItem>
			);
		}

		// set selectedText as `published` as default
		selectedText = selectedText || 'published';
		selectedCount = selectedCount || this.getCountByStatus( 'publish' );

		let tabs = (
			<NavTabs
				label={ this.strings.status }
				selectedText={ selectedText }
				selectedCount={ selectedCount }
			>
				{ statusItems }
			</NavTabs>
		);

		return {
			element: tabs,
			selectedText: selectedText
		};
	},

	_getAuthorSegmented( statusSlug, siteFilter ) {
		var scopeItems = [],
			selectedText, scope;

		for ( scope in this.filterScope ) {
			let textItem = this.filterScope[ scope ];
			let path = ( 'me' === scope ? '/posts/my' : '/posts' ) + statusSlug + siteFilter;

			if ( path === this.props.context.pathname ) {
				selectedText = textItem;
			}

			scopeItems.push(
				<NavItem
					key={ 'authorSegmented' + path }
					path={ path }
					selected={ path === this.props.context.pathname }
				>
					{ textItem }
				</NavItem>
			);
		}

		return {
			element: (
				<NavSegmented label={ this.strings.author }>
					{ scopeItems }
				</NavSegmented>
			),
			selectedText: selectedText
		};
	},

	_getMobileHeaderText( showMyFilter, statusSelectedText, authorSelectedText ) {
		if ( ! showMyFilter ) {
			return statusSelectedText;
		}

		return (
			<span>
				<span>{ statusSelectedText }</span>
				<small>{ authorSelectedText }</small>
			</span>
		);
	},

	/**
	 * Return count of the given status
	 *
	 * @param {String} status - status type
	 * @return {Number|Null} return count of the given status
	 */
	getCountByStatus( status ) {
		if ( ! this.props.counts ) {
			return;
		}

		return this.props.counts[ status ];
	}
} );

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const isMine = !! ownProps.author;

	let counts;
	if ( isMine ) {
		counts = getMyPostCounts( state, siteId, 'post' );
	} else {
		counts = getAllPostCounts( state, siteId, 'post' );
	}

	return {
		siteId,
		jetpackSite: isJetpackSite( state, siteId ),
		counts: getConsolidatedCounts( counts )
	}
} )( PostsNavigation );
