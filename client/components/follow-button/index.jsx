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
		onFollowToggle: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onFollowToggle: noop
		};
	},

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores() {
		return { following: FeedSubscriptionStore.getIsFollowingBySiteUrl( this.props.siteUrl ) };
	},

	componentDidMount() {
		FeedSubscriptionStore.on( 'change', this.onStoreChange );
	},

	componentWillUnmount() {
		FeedSubscriptionStore.off( 'change', this.onStoreChange );
	},

	onStoreChange() {
		const newState = this.getStateFromStores();
		if ( newState.following !== this.state.following ) {
			this.setState( newState );
		}
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
				disabled={ this.props.disabled }/>
		);
	}
} );

export default FollowButtonContainer;
