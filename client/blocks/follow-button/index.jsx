/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import FollowButton from './button';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';

const FollowButtonContainer = React.createClass( {
	propTypes: {
		siteUrl: React.PropTypes.string.isRequired,
		iconSize: React.PropTypes.number,
		onFollowToggle: React.PropTypes.func,
		followLabel: React.PropTypes.string,
		followingLabel: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			onFollowToggle: noop
		};
	},

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		return { following: FeedSubscriptionStore.getIsFollowingBySiteUrl( props.siteUrl ) };
	},

	componentDidMount() {
		FeedSubscriptionStore.on( 'change', this.onStoreChange );
	},

	componentWillUnmount() {
		FeedSubscriptionStore.off( 'change', this.onStoreChange );
	},

	componentWillReceiveProps( nextProps ) {
		this.updateState( nextProps );
	},

	updateState( props = this.props ) {
		const newState = this.getStateFromStores( props );
		if ( newState.following !== this.state.following ) {
			this.setState( newState );
		}
	},

	onStoreChange() {
		this.updateState();
	},

	handleFollowToggle( following ) {
		FeedSubscriptionActions[ following ? 'follow' : 'unfollow' ]( this.props.siteUrl );
		this.props.onFollowToggle( following );
	},

	render() {
		return (
			<FollowButton
				following={ this.state.following }
				onFollowToggle={ this.handleFollowToggle }
				iconSize={ this.props.iconSize }
				tagName={ this.props.tagName }
				disabled={ this.props.disabled }
				followLabel={ this.props.followLabel }
				followingLabel={ this.props.followingLabel }
				className={ this.props.className } />
		);
	}
} );

export default FollowButtonContainer;
