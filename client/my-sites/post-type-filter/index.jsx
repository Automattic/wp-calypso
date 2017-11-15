/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { compact, find, includes, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite, getSiteSlug } from 'state/sites/selectors';
import { getNormalizedMyPostCounts, getNormalizedPostCounts } from 'state/posts/counts/selectors';
import { isMultiSelectEnabled } from 'state/ui/post-type-list/selectors';
import { toggleMultiSelect } from 'state/ui/post-type-list/actions';
import { mapPostStatus } from 'lib/route/path';
import { isEnabled } from 'config';
import UrlSearch from 'lib/mixins/url-search';
import QueryPostCounts from 'components/data/query-post-counts';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import AuthorSegmented from './author-segmented';
import Button from 'components/button';
import Gridicon from 'gridicons';

const PostTypeFilter = createReactClass( {
	displayName: 'PostTypeFilter',
	mixins: [ UrlSearch ],

	propTypes: {
		authorToggleHidden: PropTypes.bool,
		siteId: PropTypes.number,
		query: PropTypes.shape( {
			author: PropTypes.number, // User ID
			status: PropTypes.string,
			type: PropTypes.string.isRequired,
		} ),
		jetpack: PropTypes.bool,
		siteSlug: PropTypes.string,
		counts: PropTypes.object,
	},

	getNavItems() {
		const { query, siteId, siteSlug, jetpack, counts } = this.props;

		return reduce(
			counts,
			( memo, count, status ) => {
				// * Always add 'publish' and 'draft' tabs
				// * Add all tabs in all-sites mode
				// * Add all tabs in JP mode, for CPTs
				// * In all other cases, add status tabs only if there's at least one post/CPT with that status
				if (
					siteId &&
					! ( jetpack && query.type !== 'post' ) &&
					! count &&
					! includes( [ 'publish', 'draft' ], status )
				) {
					return memo;
				}

				let label, pathStatus;
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
					count: ! siteId || ( jetpack && query.type !== 'post' ) ? null : count,
					path: compact( [
						query.type === 'post' ? '/posts' : '/types/' + query.type,
						query.type === 'post' && query.author && 'my',
						pathStatus,
						siteSlug,
					] ).join( '/' ),
					selected: mapPostStatus( pathStatus ) === query.status,
					children: label,
				} );
			},
			[]
		);
	},

	renderMultiSelectButton() {
		if ( ! isEnabled( 'posts/post-type-list/bulk-edit' ) ) {
			return null;
		}

		const {
			translate,
			isMultiSelectEnabled: isMultiSelectButtonEnabled,
			toggleMultiSelect: onMultiSelectClick,
		} = this.props;

		const classes = classnames( 'post-type-filter__multi-select-button', {
			'is-enabled': isMultiSelectButtonEnabled,
		} );

		return (
			<Button className={ classes } borderless onClick={ onMultiSelectClick }>
				<Gridicon icon="list-checkmark" />
				<span className="post-type-filter__multi-select-button-text">
					{ translate( 'Select' ) }
				</span>
			</Button>
		);
	},

	render() {
		const { authorToggleHidden, jetpack, query, siteId, statusSlug } = this.props;

		if ( ! query ) {
			return null;
		}

		const navItems = this.getNavItems();
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
						{ navItems.map( props => <NavItem { ...props } /> ) }
					</NavTabs>
					{ ! authorToggleHidden && (
						<AuthorSegmented author={ query.author } siteId={ siteId } statusSlug={ statusSlug } />
					) }
					<Search
						pinned
						fitsContainer
						onSearch={ this.doSearch }
						placeholder={ this.props.translate( 'Search…' ) }
						delaySearch={ true }
					/>
					{ this.renderMultiSelectButton() }
				</SectionNav>
			</div>
		);
	},
} );

export default connect(
	( state, { query } ) => {
		const siteId = getSelectedSiteId( state );
		let authorToggleHidden = false;
		if ( query && query.type === 'post' ) {
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
			isMultiSelectEnabled: isMultiSelectEnabled( state ),
		};

		if ( ! query ) {
			return props;
		}

		return {
			...props,
			counts: query.author
				? getNormalizedMyPostCounts( state, siteId, query.type )
				: getNormalizedPostCounts( state, siteId, query.type ),
		};
	},
	{
		toggleMultiSelect,
	}
)( localize( PostTypeFilter ) );
