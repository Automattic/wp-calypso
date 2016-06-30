//const debug = require( 'debug' )( 'calypso:reader:following:edit' );

// External dependencies
const React = require( 'react' ),
	classnames = require( 'classnames' );

// Internal dependencies
const Card = require( 'components/card' ),
	FormToggle = require( 'components/forms/form-toggle' ),
	SegmentedControl = require( 'components/segmented-control' ),
	ControlItem = require( 'components/segmented-control/item' ),
	PostEmailSubscriptionStore = require( 'lib/reader-post-email-subscriptions' ),
	CommentEmailSubscriptionStore = require( 'lib/reader-comment-email-subscriptions' ),
	PostEmailSubscriptionActions = require( 'lib/reader-post-email-subscriptions/actions' ),
	CommentEmailSubscriptionActions = require( 'lib/reader-comment-email-subscriptions/actions' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	smartSetState = require( 'lib/react-smart-set-state' );

const DELIVERY_FREQUENCY_INSTANTLY = 'instantly',
	DELIVERY_FREQUENCY_DAILY = 'daily',
	DELIVERY_FREQUENCY_WEEKLY = 'weekly';

var FollowingEditNotificationSettings = React.createClass( {

	propTypes: {
		subscription: React.PropTypes.object.isRequired,
		isEmailBlocked: React.PropTypes.bool
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function( props = this.props ) {
		const blogId = props.subscription.get( 'blog_ID' ),
			postEmailSubscription = PostEmailSubscriptionStore.getSubscription( blogId ),
			commentEmailSubscription = CommentEmailSubscriptionStore.getSubscription( blogId ),
			postEmailError = PostEmailSubscriptionStore.getLastErrorByBlog( blogId ),
			commentEmailError = CommentEmailSubscriptionStore.getLastErrorByBlog( blogId );

		let newState = {
			postEmailSubscription,
			commentEmailSubscription,
			postEmailError,
			commentEmailError
		};

		// Set the initial value for emailDeliveryFrequency if we have an existing subscription
		if ( ( ! this.state || ! this.state.emailDeliveryFrequency ) && postEmailSubscription ) {
			newState.emailDeliveryFrequency = postEmailSubscription.get( 'delivery_frequency' );
		}

		return newState;
	},

	componentDidMount: function() {
		PostEmailSubscriptionStore.on( 'change', this.handleChange );
		CommentEmailSubscriptionStore.on( 'change', this.handleChange );
	},

	componentWillUnmount: function() {
		PostEmailSubscriptionStore.off( 'change', this.handleChange );
		CommentEmailSubscriptionStore.off( 'change', this.handleChange );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	smartSetState: smartSetState,

	handleChange: function() {
		if ( this.isMounted() ) {
			this.smartSetState( this.getStateFromStores() );
		}
	},

	handleEmailFrequencyClick: function( newFrequency ) {
		this.setState( { emailDeliveryFrequency: newFrequency } );
		PostEmailSubscriptionActions.updateDeliveryFrequency( this.props.subscription.get( 'blog_ID' ), newFrequency );
	},

	handlePostEmailToggle: function() {
		if ( this.state.postEmailSubscription ) {
			PostEmailSubscriptionActions.unsubscribe( this.props.subscription.get( 'blog_ID' ) );
		} else {
			PostEmailSubscriptionActions.subscribe( this.props.subscription.get( 'blog_ID' ), this.state.emailDeliveryFrequency );
		}
	},

	handleCommentEmailToggle: function() {
		const subscription = this.props.subscription;
		if ( this.state.commentEmailSubscription ) {
			CommentEmailSubscriptionActions.unsubscribe( subscription.get( 'blog_ID' ) );
		} else {
			CommentEmailSubscriptionActions.subscribe( subscription.get( 'blog_ID' ) );
		}
	},

	renderPostEmailError: function() {
		return this.renderEmailError( 'post' );
	},

	renderCommentEmailError: function() {
		return this.renderEmailError( 'comment' );
	},

	renderEmailError: function( subscriptionType ) {
		if ( subscriptionType !== 'post' && subscriptionType !== 'comment' ) {
			return;
		}

		const error = this.state[ subscriptionType + 'EmailError' ];

		if ( ! error ) {
			return null;
		}

		return (
			<div className="following-edit__notification-settings-error">
				<FormInputValidation className="following-edit__notification-settings-error" isError text={ this.translate( 'Sorry, there was a problem changing your subscription settings.' ) } />
			</div>
		);
	},

	render: function() {
		var subscription = this.props.subscription,
			isExternal = ( ! subscription.get( 'blog_ID' ) || subscription.get( 'blog_ID' ) < 1 ),
			emailDeliveryFrequency = this.state.emailDeliveryFrequency,
			isPostEmailActive = !! this.state.postEmailSubscription,
			isCommentEmailActive = !! this.state.commentEmailSubscription,
			postEmailClasses = classnames( 'is-compact following-edit__notification-settings-card', {
				'is-active': isPostEmailActive,
			} ),
			commentEmailClasses = classnames( 'is-compact following-edit__notification-settings-card', {
				'is-active': isCommentEmailActive,
			} );

		if ( isExternal ) {
			return (
				<Card className="is-compact is-impossible-to-send-email following-edit__notification-settings-card" key={ 'notification-settings-comments-' + subscription.get( 'ID' ) }>
					<p>{ this.translate( 'RSS feeds do not allow for email notifications.' ) }</p>
				</Card>
			);
		}

		if ( this.props.isEmailBlocked ) {
			return (
				<Card className="is-compact is-impossible-to-send-email following-edit__notification-settings-card" key={ 'notification-settings-comments-' + subscription.get( 'ID' ) }>
					<p>{ this.translate( 'You have blocked all email updates from your subscribed blogs.' ) }</p>
					<p>{ this.translate( 'You can change this in your {{settingsLink}}Notification Settings{{/settingsLink}}.',
						{
							components: {
								settingsLink: <a href="/me/notifications/subscriptions" />
							}
						} )
						}
					</p>
				</Card>
			);
		}

		return (
			<div>
				<Card className={ postEmailClasses } key={ 'notification-settings-posts-' + subscription.get( 'ID' ) }>
					<span>{ this.translate( 'Emails for new posts' ) }</span>
					<span className="following-edit__form-toggle-wrapper">
						<span className="following-edit__form-toggle-status">{ isPostEmailActive ? 'on' : 'off' }</span>
						<FormToggle id="following-edit__form-toggle-post-emails" onChange={ this.handlePostEmailToggle } checked={ isPostEmailActive } disabled={ false } />
					</span>
					{ isPostEmailActive ?
						<SegmentedControl compact={ true }>
							<ControlItem selected={ emailDeliveryFrequency === DELIVERY_FREQUENCY_INSTANTLY } onClick={ this.handleEmailFrequencyClick.bind( this, DELIVERY_FREQUENCY_INSTANTLY ) } key={ 'delivery-frequency-instant' }>{ this.translate( 'Instant' ) }</ControlItem>
							<ControlItem selected={ emailDeliveryFrequency === DELIVERY_FREQUENCY_DAILY } onClick={ this.handleEmailFrequencyClick.bind( this, DELIVERY_FREQUENCY_DAILY ) } key={ 'delivery-frequency-daily' }>{ this.translate( 'Daily' ) }</ControlItem>
							<ControlItem selected={ emailDeliveryFrequency === DELIVERY_FREQUENCY_WEEKLY } onClick={ this.handleEmailFrequencyClick.bind( this, DELIVERY_FREQUENCY_WEEKLY ) } key={ 'delivery-frequency-weekly' }>{ this.translate( 'Weekly' ) }</ControlItem>
						</SegmentedControl> : null }
					{ this.renderPostEmailError() }
				</Card>

				<Card className={ commentEmailClasses } key={ 'notification-settings-comments-' + subscription.get( 'ID' ) }>
					<span>{ this.translate( 'Emails for new comments' ) }</span>
					<span className="following-edit__form-toggle-wrapper">
						<span className="following-edit__form-toggle-status">{ isCommentEmailActive ? 'on' : 'off' }</span>
						<FormToggle id="following-edit__form-toggle-comment-emails" onChange={ this.handleCommentEmailToggle } checked={ isCommentEmailActive } disabled={ false } />
					</span>
					{ this.renderCommentEmailError() }
				</Card>
			</div>
		);
	}

} );

module.exports = FollowingEditNotificationSettings;
