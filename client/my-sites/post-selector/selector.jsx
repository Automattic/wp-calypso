/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import camelCase from 'lodash/camelCase';
import throttle from 'lodash/throttle';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import NoResults from './no-results';
import analytics from 'analytics';
import Search from './search';
import { decodeEntities } from 'lib/formatting';
import {
	getSitePostsForQueryIgnoringPage,
	getSitePostsHierarchyForQueryIgnoringPage,
	isRequestingSitePostsForQuery,
	isSitePostsLastPageForQuery
} from 'state/posts/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import QueryPosts from 'components/data/query-posts';

/**
* Constants
*/
const SEARCH_DEBOUNCE_TIME_MS = 500;
const SCROLL_THROTTLE_TIME_MS = 400;

const PostSelectorPosts = React.createClass( {
	displayName: 'PostSelectorPosts',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		query: PropTypes.object,
		posts: PropTypes.array,
		postsHierarchy: PropTypes.array,
		page: PropTypes.number,
		lastPage: PropTypes.bool,
		loading: PropTypes.bool,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		selected: PropTypes.number,
		onSearch: PropTypes.func,
		onChange: PropTypes.func,
		onNextPage: PropTypes.func,
		multiple: PropTypes.bool,
		showTypeLabel: PropTypes.bool
	},

	getInitialState() {
		return { searchTerm: null };
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Post Selector',
			searchThreshold: 8,
			loading: true,
			emptyMessage: '',
			posts: [],
			onSearch: () => {},
			onChange: () => {},
			onNextPage: () => {}
		};
	},

	componentDidMount() {
		this.checkScrollPosition = throttle( function() {
			const node = ReactDom.findDOMNode( this );

			if ( ( node.scrollTop + node.clientHeight ) >= node.scrollHeight ) {
				this.maybeFetchNextPage();
			}
		}, SCROLL_THROTTLE_TIME_MS ).bind( this );
	},

	componentWillMount() {
		this.debouncedSearch = debounce( function() {
			this.props.onSearch( this.state.searchTerm );
		}.bind( this ), SEARCH_DEBOUNCE_TIME_MS );
	},

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.posts && ! this.props.posts.length ) &&
			this.state.searchTerm;
	},

	hasNoPosts() {
		return ! this.props.loading && ( this.props.posts && ! this.props.posts.length );
	},

	renderItem( item ) {
		const itemId = item.ID;
		const name = item.title || this.translate( 'Untitled' );
		const checked = this.props.selected === item.ID;
		const inputType = this.props.multiple ? 'checkbox' : 'radio';
		const domId = camelCase( this.props.analyticsPrefix ) + '-option-' + itemId;
		const postType = get( this.props.postTypes, [ item.type, 'labels', 'singular_name' ], '' );

		const input = (
			<input
				id={ domId }
				type={ inputType }
				name="posts"
				value={ itemId }
				onChange={ this.props.onChange.bind( null, item ) }
				checked={ checked }
				className="post-selector__input" />
		);

		return (
			<li key={ 'post-' + itemId } className="post-selector__list-item">
				<label>
					{ input }
					<span className="post-selector__label">
						{ decodeEntities( name ) }
						<span className="post-selector__label-type">
							{ decodeEntities( postType ) }
						</span>
					</span>
				</label>
				{ item.items ? this.renderHierarchy( item.items, true ) : null }
			</li>
		);
	},

	onSearch( event ) {
		const newSearch = event.target.value;

		if ( this.state.searchTerm && ! newSearch.length ) {
			this.props.onSearch( '' );
		}

		if ( newSearch !== this.state.searchTerm ) {
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Post Search' );
			this.setState( { searchTerm: event.target.value } );
			this.debouncedSearch();
		}
	},

	renderHierarchy( items, isRecursive ) {
		const listClass = isRecursive ? 'post-selector__nested-list' : 'post-selector__list';

		return (
			<ul className={ listClass }>
				{ items.map( this.renderItem, this ) }
				{
					this.props.loading && ! isRecursive ?
					this.renderPlaceholderItem() :
					null
				}
			</ul>
		);
	},

	renderPlaceholderItem() {
		const inputType = this.props.multiple ? 'checkbox' : 'radio';

		return (
			<li>
				<input className="post-selector__input" type={ inputType } name="posts" disabled={ true } />
				<label><span className="placeholder-text">Loading list of options...</span></label>
			</li>
		);
	},

	renderPlaceholder() {
		return ( <ul>{ this.renderPlaceholderItem() }</ul> );
	},

	maybeFetchNextPage() {
		if ( this.props.lastPage || this.props.loading ) {
			return;
		}

		this.props.onNextPage();
	},

	render() {
		const numberPosts = this.props.posts ? this.props.posts.length : 0;
		const showSearch = ( numberPosts > this.props.searchThreshold ) || this.state.searchTerm;

		let showTypeLabels;
		if ( 'boolean' === typeof this.props.showTypeLabels ) {
			showTypeLabels = this.props.showTypeLabels;
		} else {
			showTypeLabels = 'any' === this.props.query.type;
		}

		const classes = classNames(
			'post-selector',
			this.props.className, {
				'is-loading': this.props.loading,
				'is-compact': ! showSearch && ! this.props.loading,
				'is-type-labels-visible': showTypeLabels
			}
		);

		return (
			<div className={ classes } onScroll={ this.checkScrollPosition }>
				<QueryPosts siteId={ this.props.siteId } query={ this.props.query } />
				{ showTypeLabels && <QueryPostTypes siteId={ this.props.siteId } /> }
				{ showSearch ?
					<Search searchTerm={ this.state.searchTerm } onSearch={ this.onSearch } /> :
					null
				}
				{
					this.hasNoSearchResults() ?
					<NoResults createLink={ this.props.createLink } noResultsMessage={ this.props.noResultsMessage } /> :
					null
				}
				{
					this.hasNoPosts() ?
					<span className='is-empty-content'>{ this.props.emptyMessage }</span> :
					null
				}
				<form className="post-selector__results">
					{ this.props.postsHierarchy
						? this.renderHierarchy( this.props.postsHierarchy )
						: this.renderPlaceholder() }
				</form>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, query } = ownProps;
	return {
		posts: getSitePostsForQueryIgnoringPage( state, siteId, query ),
		postsHierarchy: getSitePostsHierarchyForQueryIgnoringPage( state, siteId, query ),
		lastPage: isSitePostsLastPageForQuery( state, siteId, query ),
		loading: isRequestingSitePostsForQuery( state, siteId, query ),
		postTypes: getPostTypes( state, siteId )
	};
} )( PostSelectorPosts );
