/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Debug from 'debug';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import URLSearch from 'lib/mixins/url-search';
import PostCountsStore from 'lib/posts/post-counts-store';
import Gravatar from 'components/gravatar';
import userLib from 'lib/user';
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isSingleUserSite } from 'state/sites/selectors';

const debug = new Debug( 'calypso:posts-navigation' );
const user = userLib();

// Path converter
const statusToDescription = {
	publish: 'published',
	draft: 'drafts',
	future: 'scheduled',
	trash: 'trashed'
};

const PostsNavigation = React.createClass( {
	displayName: 'PostsNavigation',

	propTypes: {
		context: React.PropTypes.object.isRequired,
		author: React.PropTypes.number,
		statusSlug: React.PropTypes.string,
		search: React.PropTypes.string
	},

	mixins: [ URLSearch ],

	getInitialState() {
		var counts = this._getCounts(),
			state = {
				show: true,
				loading: true,
				counts: ! this.props.siteId
					? this._defaultCounts()
					: this._getCounts()
			};

		if ( ! this.props.siteId || Object.keys( counts ).length ) {
			state.loading = false;
		}

		return state;
	},

	componentWillMount() {
		PostCountsStore.on( 'change', this._updatePostCounts );
	},

	componentWillUnmount() {
		PostCountsStore.off( 'change', this._updatePostCounts );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteID !== nextProps.siteID ||
			this.props.author !== nextProps.author ||
			this.props.statusSlug !== nextProps.statusSlug ) {
			this._setPostCounts( nextProps.siteID, nextProps.author ? 'mine' : 'all' );
		}
	},

	render() {
		if ( ! this.state.show ) {
			return null;
		}

		if ( this.state.loading ) {
			return ( <SectionNav /> );
		}

		const author = this.props.author ? '/my' : '',
			statusSlug = this.props.statusSlug ? '/' + this.props.statusSlug : '',
			siteFilter = this.props.siteId ? '/' + this.props.siteId : '';
		let showMyFilter = true;

		this.filterStatuses = {
			publish: this.translate( 'Published', { context: 'Filter label for posts list' } ),
			draft: this.translate( 'Drafts', { context: 'Filter label for posts list' } ),
			future: this.translate( 'Scheduled', { context: 'Filter label for posts list' } ),
			trash: this.translate( 'Trashed', { context: 'Filter label for posts list' } )
		};

		this.filterScope = {
			me: this.translate( 'Me', { context: 'Filter label for posts list' } ),
			everyone: this.translate( 'Everyone', { context: 'Filter label for posts list' } )
		};

		this.strings = {
			status: this.translate( 'Status', { context: 'Filter group label for tabs' } ),
			author: this.translate( 'Author', { context: 'Filter group label for segmented' } ),
		};

		let statusTabs = this._getStatusTabs( author, siteFilter );
		let authorSegmented = this._getAuthorSegmented( statusSlug, siteFilter );

		if ( this.props.siteId ) {
			if ( this.props.isSingleUser || this.props.isJetpack ) {
				showMyFilter = false;
			}
		} else if ( this.props.allSingleSites ) {
			showMyFilter = false;
		}

		let mobileHeaderText = this._getMobileHeaderText(
			showMyFilter, statusTabs.selectedText, authorSegmented.selectedText
		);

		return (
			<SectionNav selectedText={ mobileHeaderText }>
				{ statusTabs.element }
				{ ( showMyFilter ) ?
					authorSegmented.element : null
				}
				<Search
					pinned
					fitsContainer
					onSearch={ this.doSearch }
					initialValue={ this.props.search }
					placeholder={ 'Search ' + statusTabs.selectedText + '...' }
					analyticsGroup="Posts"
					delaySearch={ true } />
			</SectionNav>
		);
	},

	_getStatusTabs( author, siteFilter ) {
		var statusItems = [],
			status, selectedText, selectedCount;

		for ( status in this.filterStatuses ) {
			if ( 'undefined' === typeof this.state.counts[ status ] && 'publish' !== status ) {
				continue;
			}

			let path = '/posts' + author +
				( 'publish' === status ? '' : '/' + statusToDescription[ status ] ) +
				siteFilter;

			let textItem = this.filterStatuses[ status ];

			let count = this.state.counts[ status ];

			if ( path === this.props.context.pathname ) {
				selectedText = textItem;

				selectedCount = count;
			}

			if ( 'publish' === status && ! count ) {
				count = 0;
			}

			statusItems.push(
				<NavItem
					className={ 'is-' + status }
					key={ 'statusTabs' + path }
					path={ path }
					count={ this.props.siteId && count }
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
			const isMe = 'me' === scope;
			let path = ( isMe ? '/posts/my' : '/posts' ) + statusSlug + siteFilter;

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
					{ isMe && <Gravatar size={ 16 } user={ user.get() } /> }
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

	_defaultCounts() {
		var default_options = {},
			status;

		for ( status in statusToDescription ) {
			default_options[ status ] = false;
		}

		return default_options;
	},

	_defaultStateOptions() {
		this.setState( {
			show: true,
			loading: false,
			counts: this._defaultCounts()
		} );
	},

	/**
	 * Set immediately post filters state
	 *
	 * @param {String} siteID - site ID
	 * @param {String} scope - scope `all` or `mine`
	 * @return {void}
	 */
	_setPostCounts( siteID, scope ) {
		// print default filters for `All my Sites`
		if ( ! siteID || null === this.props.siteId ) {
			return this._defaultStateOptions();
		}

		if ( ! PostCountsStore.getTotalCount( siteID, 'all' ) ) {
			return this.setState( {
				show: true,
				loading: true
			} );
		}

		this.setState( {
			show: true,
			loading: false,
			counts: this._getCounts( siteID, scope )
		} );
	},

	_updatePostCounts( siteID = this.props.siteId, scope ) {
		scope = scope || ( this.props.author ? 'mine' : 'all' );

		// is `All my sites` selected`
		if ( ! this.props.siteId ) {
			return this._defaultStateOptions();
		}

		const state = {
			show: true,
			loading: false,
			counts: {}
		};

		if ( PostCountsStore.getTotalCount( siteID, 'all' ) ) {
			state.counts = this._getCounts( siteID, scope );
		} else {
			debug( '[%s] clean counts', siteID || 'All my sites' );
			state.show = false;
			state.counts = {};
		}

		this.setState( state );
	},

	/**
	 * Return a counts object depending on current
	 * counts for `all` scope, filling with zeros for
	 * `me` scope.
	 * Also calc and remove unallowed statuses.
	 *
	 * @param {String} siteID - Site identifier
	 * @param {String} [scope] - Optional scope (mine or all)
	 * @return {Object} counts
	 */
	_getCounts( siteID = this.props.siteId, scope ) {
		var counts = {},
			status;

		scope = scope || ( this.props.author ? 'mine' : 'all' );
		let all = PostCountsStore.get( siteID, 'all' );
		let mine = PostCountsStore.get( siteID, 'mine' );

		// make a copy of counts object
		for ( status in all ) {
			counts[ status ] = 'all' === scope ?
				all[ status ] :
				( mine[ status ] || 0 );
		}

		// join 'draft' and 'pending' statuses in 'draft'
		if ( counts.draft || counts.pending ) {
			counts.draft = ( counts.draft || 0 ) + ( counts.pending || 0 );
			delete counts.pending;
		}

		// join 'public' and 'private' statuses in 'publish'
		if ( counts.publish || counts.private ) {
			counts.publish = ( counts.publish || 0 ) + ( counts.private || 0 );
			delete counts.private;
		}

		return counts;
	},

	/**
	 * Return count of the given status
	 *
	 * @param {String} status - status type
	 * @return {Number|Null} return count of the given status
	 */
	getCountByStatus( status ) {
		const count = this.state.counts[ status ];
		return ( count !== false ) ? count : null;
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			allSingleSites: areAllSitesSingleUser( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isSingleUser: isSingleUserSite( state, siteId ),
			siteId
		};
	}
)( PostsNavigation );
