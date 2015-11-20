/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PostListStore = require( 'lib/posts/post-list-store' ),
	PostContentImagesStore = require( 'lib/posts/post-content-images-store' ),
	Dispatcher = require( 'dispatcher' ),
	actions = require( 'lib/posts/actions' ),
	pollers = require( 'lib/data-poller' );

var PostListFetcher;

function dispatchQueryActions( query ) {
	actions.queryPosts( query );

	if ( PostListStore.getPage() === 0 ) {
		actions.fetchNextPage();
	}
}

function queryPosts( props ) {
	var query = {
		type: props.type || 'post',
		siteID: props.siteID,
		status: props.status,
		author: props.author,
		search: props.search,
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
			dispatchQueryActions( query );
		}, 0 );
	} else {
		dispatchQueryActions( query );
	}
}

function getPostsState() {
	return {
		listId: PostListStore.getID(),
		posts: PostListStore.getAll(),
		postImages: PostContentImagesStore.getAll(),
		page: PostListStore.getPage(),
		lastPage: PostListStore.isLastPage(),
		loading: PostListStore.isFetchingNextPage()
	};
}

function shouldQueryPosts( props, nextProps ) {
	// evaluates props that are used to build the post-list query,
	// withImages is excluded because it is only used client-side

	return props.type !== nextProps.type ||
		props.status !== nextProps.status ||
		props.author !== nextProps.author ||
		props.search !== nextProps.search ||
		props.excludeTree !== nextProps.excludeTree ||
		props.withCounts !== nextProps.withCounts ||
		props.orderBy !== nextProps.orderBy ||
		props.order !== nextProps.order ||
		props.number !== nextProps.number ||
		props.before !== nextProps.before ||
		props.after !== nextProps.after ||
		props.siteID !== nextProps.siteID;
}

PostListFetcher = React.createClass( {

	propTypes: {
		children: React.PropTypes.element.isRequired,
		type: React.PropTypes.string,
		status: React.PropTypes.string,
		author: React.PropTypes.number,
		search: React.PropTypes.string,
		siteID: React.PropTypes.any,
		withImages: React.PropTypes.bool,
		withCounts: React.PropTypes.bool,
		excludeTree: React.PropTypes.number,
		orderBy: React.PropTypes.oneOf(
			[ 'title', 'date', 'modified', 'comment_count', 'ID' ]
		),
		order: React.PropTypes.oneOf( [ 'ASC', 'DESC' ] ),
		number: React.PropTypes.number,
		before: React.PropTypes.string,
		after: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			orderBy: 'date',
			order: 'DESC'
		};
	},

	componentWillMount: function() {
		PostListStore.on( 'change', this.onPostsChange );
		if ( this.props.withImages ) {
			PostContentImagesStore.on( 'change', this.onPostsChange );
		}
		queryPosts( this.props );
	},

	componentDidMount: function() {
		this._poller = pollers.add( PostListStore, actions.fetchUpdated, { interval: 60000, leading: false } );
	},

	componentWillUnmount: function() {
		pollers.remove( this._poller );
		PostListStore.off( 'change', this.onPostsChange );
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
		this.setState( getPostsState( this.props ) );
	},

	render: function() {
		// Clone the child element along and pass along state (containing data from the stores)
		return React.cloneElement( this.props.children, this.state );
	}

} );

module.exports = PostListFetcher;
