/**
 * External Dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/noop' );

/**
 * Internal Dependencies
 */
var FollowButton = require( './button' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions' );

var FollowButtonContainer = React.createClass( {
	propTypes: {
		siteUrl: React.PropTypes.string.isRequired,
		iconSize: React.PropTypes.number,
		onFollowToggle: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			onFollowToggle: noop
		};
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function() {
		return { following: FeedSubscriptionStore.getIsFollowingBySiteUrl( this.props.siteUrl ) };
	},

	componentDidMount: function() {
		FeedSubscriptionStore.on( 'change', this.onStoreChange );
	},

	componentWillUnmount: function() {
		FeedSubscriptionStore.off( 'change', this.onStoreChange );
	},

	onStoreChange: function() {
		var newState = this.getStateFromStores();
		if ( newState.following !== this.state.following ) {
			this.setState( newState );
		}
	},

	handleFollowToggle: function( following ) {
		FeedSubscriptionActions[ following ? 'follow' : 'unfollow' ]( this.props.siteUrl );
		this.props.onFollowToggle( following );
	},

	render: function() {
		return (
			<FollowButton
				following={ this.state.following }
				onFollowToggle={ this.handleFollowToggle }
				iconSize={ this.props.iconSize }
				tagName={ this.props.tagName } />
		);
	}
} );

module.exports = FollowButtonContainer;
