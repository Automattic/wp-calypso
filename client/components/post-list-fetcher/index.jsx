var PropTypes = require('prop-types');
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var postListStoreFactory = require( 'lib/posts/post-list-store-factory' ),
	PostContentImagesStore = require( 'lib/posts/post-content-images-store' ),
	Dispatcher = require( 'dispatcher' ),
	actions = require( 'lib/posts/actions' ),
	pollers = require( 'lib/data-poller' );

var PostListFetcher;

function dispatchQueryActions( postListStoreId, query ) {
	var postListStore = postListStoreFactory( postListStoreId );
	actions.queryPosts( query, postListStoreId );

	if ( postListStore.getPage() === 0 ) {
		actions.fetchNextPage( postListStoreId );
	}
}

function queryPosts( props ) {
	var query = {
		type: props.type || 'post',
		siteId: props.siteId,
		status: props.status,
		author: props.author,
		search: props.search,
		category: props.category,
		tag: props.tag,
		exclude_tree: props.excludeTree,
		orderBy: props.orderBy,
		order: props.order,
		number: props.number,
		before: props.before,
		after: props.after
	};

	if ( props.withCounts ) {
		query.meta = 'counts';
	}

	// This is to avoid dispatching during a dispatch.
	// Not ideal nor a best practice
	if ( Dispatcher.isDispatching() ) {
		setTimeout( function() {
			dispatchQueryActions( props.postListStoreId, query );
		}, 0 );
	} else {
		dispatchQueryActions( props.postListStoreId, query );
	}
}

function getPostsState( postListStoreId ) {
	var postListStore = postListStoreFactory( postListStoreId );
	return {
		listId: postListStore.getID(),
		posts: postListStore.getAll(),
		postImages: PostContentImagesStore.getAll(),
		page: postListStore.getPage(),
		lastPage: postListStore.isLastPage(),
		loading: postListStore.isFetchingNextPage(),
		hasRecentError: postListStore.hasRecentError()
	};
}

function shouldQueryPosts( props, nextProps ) {
	// evaluates props that are used to build the post-list query,
	// withImages is excluded because it is only used client-side

	return props.type !== nextProps.type ||
		props.status !== nextProps.status ||
		props.author !== nextProps.author ||
		props.search !== nextProps.search ||
		props.category !== nextProps.category ||
		props.tag !== nextProps.tag ||
		props.excludeTree !== nextProps.excludeTree ||
		props.withCounts !== nextProps.withCounts ||
		props.orderBy !== nextProps.orderBy ||
		props.order !== nextProps.order ||
		props.number !== nextProps.number ||
		props.before !== nextProps.before ||
		props.after !== nextProps.after ||
		props.siteId !== nextProps.siteId ||
		props.postListStoreId !== nextProps.postListStoreId;
}

PostListFetcher = React.createClass( {

	propTypes: {
		children: PropTypes.element.isRequired,
		type: PropTypes.string,
		status: PropTypes.string,
		author: PropTypes.number,
		search: PropTypes.string,
		category: PropTypes.string,
		tag: PropTypes.string,
		siteId: PropTypes.number,
		withImages: PropTypes.bool,
		withCounts: PropTypes.bool,
		excludeTree: PropTypes.number,
		orderBy: PropTypes.oneOf(
			[ 'title', 'date', 'modified', 'comment_count', 'ID' ]
		),
		order: PropTypes.oneOf( [ 'ASC', 'DESC' ] ),
		number: PropTypes.number,
		before: PropTypes.string,
		after: PropTypes.string,
		postListStoreId: PropTypes.string
	},

	getDefaultProps: function() {
		return {
			orderBy: 'date',
			order: 'DESC',
			postListStoreId: 'default'
		};
	},

	componentWillMount: function() {
		var postListStore = postListStoreFactory( this.props.postListStoreId );
		postListStore.on( 'change', this.onPostsChange );
		if ( this.props.withImages ) {
			PostContentImagesStore.on( 'change', this.onPostsChange );
		}
		queryPosts( this.props );
	},

	componentDidMount: function() {
		var postListStore = postListStoreFactory( this.props.postListStoreId );
		this._poller = pollers.add( postListStore, actions.fetchUpdated, { interval: 60000 } );
	},

	componentWillUnmount: function() {
		var postListStore = postListStoreFactory( this.props.postListStoreId );
		pollers.remove( this._poller );
		postListStore.off( 'change', this.onPostsChange );
		if ( this.props.withImages ) {
			PostContentImagesStore.off( 'change', this.onPostsChange );
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		var listenerChange;

		if ( shouldQueryPosts( this.props, nextProps ) ) {
			queryPosts( nextProps );
		}

		if ( nextProps.withImages !== this.props.withImages ) {
			listenerChange = ( nextProps.withImages ) ? 'on' : 'off';
			PostContentImagesStore[ listenerChange ]( 'change', this.onPostsChange );
		}
	},

	onPostsChange: function() {
		this.setState( getPostsState( this.props.postListStoreId ) );
	},

	render: function() {
		// Clone the child element along and pass along state (containing data from the stores)
		return React.cloneElement( this.props.children, this.state );
	}

} );

module.exports = PostListFetcher;
