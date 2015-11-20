/**
 * External dependencies
 */
var React = require( 'react' ),
	shallowEqual = require( 'react/lib/shallowEqual' ),
	config = require( 'config' );

/**
 * Internal dependencies
 */
var FollowingStream = require( 'reader/following-stream' ),
	EmptyContent = require( './empty' ),
	ReaderLists = require( 'lib/reader-lists/lists' ),
	ReaderListActions = require( 'lib/reader-lists/actions' ),
	ReaderListSubscriptions = require( 'lib/reader-lists/subscriptions' ),
	StreamHeader = require( 'reader/stream-header' );

var FeedStream = React.createClass( {

	getInitialState: function() {
		return {
			title: this.getTitle(),
			subscribed: this.isSubscribed()
		};
	},

	componentDidMount: function() {
		ReaderLists.on( 'change', this.updateState );
		ReaderListSubscriptions.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		ReaderLists.off( 'change', this.updateState );
		ReaderListSubscriptions.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! shallowEqual( nextProps.list, this.props.list ) ) {
			this.updateState( nextProps );
		}
	},

	updateState: function( props ) {
		props = props || this.props;
		let newState = {
			title: this.getTitle( props ),
			subscribed: this.isSubscribed( props )
		};
		if ( newState.title !== this.state.title || newState.subscribed !== this.state.subscribed ) {
			this.setState( newState );
		}
	},

	getTitle: function( props ) {
		props = props || this.props;
		let list = ReaderLists.get( props.list.owner, props.list.slug );
		if ( ! list ) {
			ReaderListActions.fetchList( props.list.owner, props.list.slug );
			return this.translate( 'Loading List' );
		}
		return list.title || list.slug;
	},

	isSubscribed: function( props ) {
		props = props || this.props;
		let list = ReaderLists.get( props.list.owner, props.list.slug );
		if ( ! list ) {
			return false;
		}
		return ReaderListSubscriptions.isSubscribed( list.owner, list.slug );
	},

	toggleFollowing: function( isFollowing ) {
		var list = ReaderLists.get( this.props.list.owner, this.props.list.slug );
		ReaderListActions[ isFollowing ? 'follow' : 'unfollow' ]( list.owner, list.slug );
	},

	render: function() {
		var list = ReaderLists.get( this.props.list.owner, this.props.list.slug ),
			shouldShowFollow = ( list && ! list.is_owner ),
			shouldShowEdit = ! shouldShowFollow,
			editUrl = null,
			emptyContent = ( <EmptyContent /> );

		if ( list ) {
			editUrl = `https://wordpress.com/read/list/${ list.owner }/${ list.slug }/edit`;

			if ( config.isEnabled( 'reader/list-management' ) ) {
				editUrl = `/read/list/${ list.owner }/${ list.slug }/edit`;
			}
		}

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title );
		}

		return (
			<FollowingStream { ...this.props } listName={ this.state.title } emptyContent={ emptyContent } showFollowInHeader={ shouldShowFollow }>
				<StreamHeader
					isPlaceholder={ ! list }
					icon={ <svg className="gridicon gridicon__list" height="32" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M9 19h10v-2H9v2zm0-6h10v-2H9v2zm0-8v2h10V5H9zm-3-.5c-.828 0-1.5.672-1.5 1.5S5.172 7.5 6 7.5 7.5 6.828 7.5 6 6.828 4.5 6 4.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm0 6c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"/></g></svg> }
					title={ this.state.title }
					description={ list && list.owner }
					showFollow={ shouldShowFollow }
					following={ this.state.subscribed }
					onFollowToggle={ this.toggleFollowing }
					showEdit={ shouldShowEdit }
					editUrl={ editUrl } />
			</FollowingStream>
		);
	}

} );

module.exports = FeedStream;
