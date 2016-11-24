/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';
import { compose } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import URLSearch from 'lib/mixins/url-search';
import Gravatar from 'components/gravatar';
import userLib from 'lib/user';
import queryGraph from 'lib/graph/query';
import { getSelectedSiteId } from 'state/ui/selectors';

const user = userLib();

// Path converter
const statusToDescription = {
	publish: 'published',
	draft: 'drafts',
	future: 'scheduled',
	trash: 'trashed'
};

const PostsNavigation = React.createClass( {
	propTypes: {
		context: React.PropTypes.object.isRequired,
		sites: React.PropTypes.object.isRequired,
		author: React.PropTypes.number,
		statusSlug: React.PropTypes.string,
		search: React.PropTypes.string
	},

	mixins: [ URLSearch ],

	render() {
		const loading = get( this.props.results, [ 'postsCount', 'requesting' ], true );
		if ( loading ) {
			return ( <SectionNav /> );
		}

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
			me: this.translate( 'Me', { context: 'Filter label for posts list' } ),
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
		const statusItems = [];
		let status, selectedText, selectedCount;
		const authorKey = author === '/my' ? 'mine' : 'all';
		const counts = get( this.props.results, [ 'postsCount', authorKey ], {} );

		for ( status in this.filterStatuses ) {
			if ( counts && ! counts[ status ] && 'publish' !== status ) {
				continue;
			}

			let path = '/posts' + author +
				( 'publish' === status ? '' : '/' + statusToDescription[ status ] ) +
				siteFilter;

			let textItem = this.filterStatuses[ status ];

			let count = counts && false !== counts[ status ]
				? counts[ status ]
				: false;

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
					count={ null === this.props.sites.selected || count }
					value={ textItem }
					selected={ path === this.props.context.pathname }>
					{ textItem }
				</NavItem>
			);
		}

		// set selectedText as `published` as default
		selectedText = selectedText || 'published';
		selectedCount = selectedCount || ( counts && counts.publish );

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
} );

export default compose(
	connect(
		state => ( {
			siteId: getSelectedSiteId( state )
		} )
	),
	queryGraph(
		`
			query PostsCountNavigation( $siteId: Int, $postType: String )
			{
				postsCount( siteId: $siteId, postType: $postType ) {
					mine {
						publish
						draft
						trash
						future
					}
					all {
						publish
						draft
						trash
						future
					}
					requesting
				}
			}
		`,
		( { siteId } ) => {
			return {
				siteId,
				postType: 'post',
			};
		}
	)
)( PostsNavigation );
