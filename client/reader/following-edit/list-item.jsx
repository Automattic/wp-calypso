/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';
import FeedDisplayHelper from 'reader/lib/feed-display-helper';
import { decodeEntities } from 'lib/formatting';
import FeedSubscriptionActions from 'lib/reader-feed-subscriptions/actions';
import ReaderFollowButton from 'reader/follow-button';
import { state as SubscriptionStates } from 'lib/reader-feed-subscriptions/constants';
import FollowingEditNotificationSettings from './notification-settings';
import FoldableCard from 'components/foldable-card';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import smartSetState from 'lib/react-smart-set-state';

import ExternalLink from 'components/external-link';

const SubscriptionListItem = React.createClass( {

	propTypes: {
		subscription: React.PropTypes.object.isRequired,
		classNames: React.PropTypes.string,
		onNotificationSettingsOpen: React.PropTypes.func,
		onNotificationSettingsClose: React.PropTypes.func,
		openCards: React.PropTypes.object,
		isEmailBlocked: React.PropTypes.bool
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return {
			classNames: '',
			onNotificationSettingsOpen: noop,
			onNotificationSettingsClose: noop
		};
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function( props = this.props ) {
		const site = SiteStore.get( props.subscription.get( 'blog_ID' ) ),
			feed = FeedStore.get( props.subscription.get( 'feed_ID' ) );

		return {
			site,
			feed
		};
	},

	smartSetState: smartSetState,

	componentDidMount: function() {
		SiteStore.on( 'change', this.handleChange );
		FeedStore.on( 'change', this.handleChange );
	},

	componentWillUnmount: function() {
		SiteStore.off( 'change', this.handleChange );
		FeedStore.off( 'change', this.handleChange );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	handleChange: function() {
		this.smartSetState( this.getStateFromStores() );
	},

	handleFollowToggle: function() {
		const action = this.isFollowing() ? 'unfollow' : 'follow';
		FeedSubscriptionActions[ action ]( this.props.subscription.get( 'URL' ), this.props.subscription.get( 'blog_ID' ) );
	},

	isFollowing: function() {
		return !! this.props.subscription && this.props.subscription.get( 'state' ) === SubscriptionStates.SUBSCRIBED;
	},

	render: function() {
		var subscription = this.props.subscription,
			siteData = this.state.site,
			feedData = this.state.feed,
			iconUrl = siteData && siteData.getIn( [ 'icon', 'img' ] ),
			siteUrl = FeedDisplayHelper.getSiteUrl( siteData, feedData, subscription ),
			displayUrl = FeedDisplayHelper.formatUrlForDisplay( siteUrl ),
			isFollowing = this.isFollowing(),
			feedTitle = decodeEntities( FeedDisplayHelper.getFeedTitle( siteData, feedData, displayUrl ) );

		/* eslint-disable react/jsx-no-target-blank */
		const cardHeader = (
			<div className="subscription-list-item__header-content">
				<Icon>{ iconUrl ? <img src={ iconUrl } alt="Feed icon" /> : null }</Icon>
				<Title>
					<a href={ FeedDisplayHelper.getFeedStreamUrl( siteData, feedData, displayUrl ) }>{ feedTitle }</a>
				</Title>
				<Description><ExternalLink icon={ true } href={ siteUrl } target="_blank" iconSize={ 12 }>{ displayUrl }</ExternalLink></Description>
				<Actions>
					<ReaderFollowButton following={ isFollowing } onFollowToggle={ this.handleFollowToggle } isButtonOnly={ true } siteUrl={ subscription.get( 'URL' ) } />
				</Actions>
			</div>
		);
		/* eslint-enable react/jsx-no-target-blank */

		const key = 'foldable-card-subscription-' + subscription.get( 'ID' ),
			isCardExpanded = this.props.openCards && this.props.openCards.includes( displayUrl );

		return (
			<FoldableCard
				onOpen={ this.props.onNotificationSettingsOpen }
				onClose={ this.props.onNotificationSettingsClose }
				ref="FoldableCard"
				key={ key }
				cardKey={ displayUrl }
				header={ cardHeader }
				className={ this.props.classNames }
				expanded={ isCardExpanded }
			>
				{ isFollowing ? <FollowingEditNotificationSettings subscription={ subscription } isEmailBlocked={ this.props.isEmailBlocked } /> : null }
			</FoldableCard>
		);
	}

} );

module.exports = SubscriptionListItem;
