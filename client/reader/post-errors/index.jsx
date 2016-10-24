// External dependencies
var React = require( 'react' ),
	shallowEqual = require( 'react-pure-render/shallowEqual' ),
	debug = require( 'debug' )( 'calypso:reader:post-options-error' ); //eslint-disable-line no-unused-vars

// Internal dependencies
var FeedSubscriptionStore = require( 'lib/reader-feed-subscriptions/index' ),
	FeedSubscriptionActions = require( 'lib/reader-feed-subscriptions/actions' ),
	FeedSubscriptionStoreErrorTypes = require( 'lib/reader-feed-subscriptions/constants' ).error,
	Notice = require( 'components/notice' ),
	SiteBlockStore = require( 'lib/reader-site-blocks/index' ),
	SiteBlockActions = require( 'lib/reader-site-blocks/actions' ),
	SiteBlockStoreErrorTypes = require( 'lib/reader-site-blocks/constants' ).error,
	stats = require( 'reader/stats' );

var PostErrors = React.createClass( {

	propTypes: { post: React.PropTypes.object.isRequired },

	getInitialState: function() {
		return this.getStateFromStores();
	},

	componentDidMount: function() {
		SiteBlockStore.on( 'change', this.updateState );
		FeedSubscriptionStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		SiteBlockStore.off( 'change', this.updateState );
		FeedSubscriptionStore.off( 'change', this.updateState );
	},

	getStateFromStores: function() {
		return {
			blockError: SiteBlockStore.getLastErrorBySite( this.props.post.site_ID ),
			followError: FeedSubscriptionStore.getLastErrorBySiteUrl( this.props.post.site_URL )
		};
	},

	updateState: function() {
		var newState = this.getStateFromStores();
		if ( ! shallowEqual( newState, this.state ) ) {
			this.setState( this.getStateFromStores() );
		}
	},

	render: function() {
		var post = this.props.post,
			errors = [];

		if ( this.state.followError ) {
			errors.push( <PostError key={ 'followError' + post.ID } error={ this.state.followError } /> );
		}

		if ( this.state.blockError ) {
			errors.push( <PostError key={ 'blockError' + post.ID } error={ this.state.blockError } /> );
		}

		if ( errors.length < 1 ) {
			return null;
		}

		return (
			<div className="reader-post-errors">
				{ errors }
			</div>
		);
	}

} );

var PostError = React.createClass( {

	propTypes: {
		error: React.PropTypes.object.isRequired
	},

	getMessage: function( errorType ) {
		var message;

		switch ( errorType ) {
			case SiteBlockStoreErrorTypes.UNABLE_TO_BLOCK:
				message = this.translate( "Sorry, we couldn't block this site. Please try again in a while." );
				break;
			case FeedSubscriptionStoreErrorTypes.UNABLE_TO_FOLLOW:
				message = this.translate( "Sorry, we couldn't follow this site. Please try again in a while." );
				break;
			case FeedSubscriptionStoreErrorTypes.UNABLE_TO_UNFOLLOW:
				message = this.translate( "Sorry, we couldn't unfollow this site. Please try again in a while." );
				break;
		}

		return message;
	},

	dismissError: function( event ) {
		var error = this.props.error;

		event.preventDefault();

		// Call originating store and mark error as dismissed
		if ( error.errorType === FeedSubscriptionStoreErrorTypes.UNABLE_TO_FOLLOW ||
				error.errorType === FeedSubscriptionStoreErrorTypes.UNABLE_TO_UNFOLLOW ) {
			FeedSubscriptionActions.dismissError( error );
			stats.recordAction( 'dismiss_follow_error' );
			stats.recordGaEvent( 'Clicked Dismiss Follow Error' );
			stats.recordTrack( 'calypso_reader_follow_error_dismissed' );
		} else if ( error.errorType === SiteBlockStoreErrorTypes.UNABLE_TO_BLOCK ) {
			SiteBlockActions.dismissError( error );
			stats.recordAction( 'dismiss_block_error' );
			stats.recordGaEvent( 'Clicked Dismiss Block Error' );
			stats.recordTrack( 'calypso_reader_block_error_dismissed' );
		}
	},

	render: function() {
		var error = this.props.error,
			message = this.getMessage( error.errorType );

		if ( ! message ) {
			return null;
		}

		return (
			<Notice isCompact={ true } text={ message } className="reader-post-errors__notice" onDismissClick={ this.dismissError } status="is-error" />
		);
	}

} );

module.exports = PostErrors;
