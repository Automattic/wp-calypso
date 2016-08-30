/**
 * External dependencies
 */
const React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
const Icon = require( 'reader/list-item/icon' ),
	Title = require( 'reader/list-item/title' ),
	Description = require( 'reader/list-item/description' ),
	Actions = require( 'reader/list-item/actions' ),
	FeedDisplayHelper = require( 'reader/lib/feed-display-helper' ),
	decodeEntities = require( 'lib/formatting' ).decodeEntities,
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	ReaderFollowButton = require( 'reader/follow-button' ),
	SubscriptionStates = require( 'lib/reader-feed-subscriptions/constants' ).state,
	FollowingEditNotificationSettings = require( './notification-settings' ),
	FoldableCard = require( 'components/foldable-card' ),
	SiteStore = require( 'lib/reader-site-store' ),
	FeedStore = require( 'lib/feed-store' ),
	smartSetState = require( 'lib/react-smart-set-state' );

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
			iconUrl = siteData && siteData.get( 'icon' ),
			siteUrl = FeedDisplayHelper.getSiteUrl( siteData, feedData, subscription ),
			displayUrl = FeedDisplayHelper.formatUrlForDisplay( siteUrl ),
			isFollowing = this.isFollowing(),
			feedTitle = decodeEntities( FeedDisplayHelper.getFeedTitle( siteData, feedData, displayUrl ) );

		const cardHeader = (
			<div className="subscription-list-item__header-content">
				<Icon>{ iconUrl ? <img src={ iconUrl.get( 'img' ) } alt="Feed icon" /> : null }</Icon>
				<Title>
					<a href={ FeedDisplayHelper.getFeedStreamUrl( siteData, feedData, displayUrl ) }>{ feedTitle }</a>
				</Title>
				<Description><ExternalLink icon={ true } href={ siteUrl } target="_blank" iconSize={ 12 }>{ displayUrl }</ExternalLink></Description>
				<Actions>
					<ReaderFollowButton following={ isFollowing } onFollowToggle={ this.handleFollowToggle } isButtonOnly={ true } siteUrl={ subscription.get( 'URL' ) } />
				</Actions>
			</div>
		);

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
