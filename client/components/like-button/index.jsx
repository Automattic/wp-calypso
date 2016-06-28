/**
 * External Dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	omit = require( 'lodash/omit' ),
	noop = require( 'lodash/noop' );

/**
 * Internal Dependencies
 */
var LikeActions = require( 'lib/like-store/actions' ),
	LikeButton = require( './button' ),
	LikeStore = require( 'lib/like-store/like-store' );

var LikeButtonContainer = React.createClass( {
	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		postId: React.PropTypes.number.isRequired,
		showCount: React.PropTypes.bool,
		tagName: React.PropTypes.string,
		onLikeToggle: React.PropTypes.func
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps: function() {
		return {
			onLikeToggle: noop
		};
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function( props = this.props, animateLike = true ) {
		return {
			likeCount: LikeStore.getLikeCountForPost( props.siteId, props.postId ) || 0,
			iLike: LikeStore.isPostLikedByCurrentUser( props.siteId, props.postId ),
			animateLike: animateLike
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ||
				this.props.postId !== nextProps.postId ) {
			const newState = this.getStateFromStores( nextProps, false );
			this.setState( newState );
		}
	},

	componentDidMount: function() {
		LikeStore.on( 'change', this.onStoreChange );
	},

	componentWillUnmount: function() {
		LikeStore.off( 'change', this.onStoreChange );
	},

	onStoreChange: function() {
		var newState = this.getStateFromStores();
		if ( newState.likeCount !== this.state.likeCount ||
				newState.iLike !== this.state.iLike ) {
			this.setState( newState );
		}
	},

	handleLikeToggle: function( liked ) {
		LikeActions[ liked ? 'likePost' : 'unlikePost' ]( this.props.siteId, this.props.postId );
		this.props.onLikeToggle( liked );
	},

	render: function() {
		var props = omit( this.props, [ 'siteId', 'postId' ] );
		return <LikeButton { ...props }
				likeCount={ this.state.likeCount }
				liked={ this.state.iLike }
				animateLike={ this.state.animateLike }
				onLikeToggle={ this.handleLikeToggle } />;
	}
} );

module.exports = LikeButtonContainer;
