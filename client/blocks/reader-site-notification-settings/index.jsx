/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import ReaderPopover from 'reader/components/reader-popover';
import SegmentedControl from 'components/segmented-control';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { getReaderFollows } from 'state/reader/follows/selectors';
import {
	subscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	unsubscribeToNewPostEmail,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from 'state/reader/follows/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import QueryUserSettings from 'components/data/query-user-settings';
import getUserSetting from 'state/selectors/get-user-setting';

/**
 * Style dependencies
 */
import './style.scss';

class ReaderSiteNotificationSettings extends Component {
	static displayName = 'ReaderSiteNotificationSettings';
	static propTypes = {
		siteId: PropTypes.number,
	};

	state = {
		showPopover: false,
		selected: this.props.emailDeliveryFrequency,
	};

	iconRef = React.createRef();
	spanRef = React.createRef();

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.emailDeliveryFrequency !== this.props.emailDeliveryFrequency ) {
			this.setState( { selected: nextProps.emailDeliveryFrequency } );
		}
	}

	togglePopoverVisibility = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
	};

	setSelected = text => () => {
		const { siteId } = this.props;
		this.setState( { selected: text } );
		this.props.updateNewPostEmailSubscription( siteId, text );

		const tracksProperties = { site_id: siteId, delivery_frequency: text };
		this.props.recordTracksEvent( 'calypso_reader_post_emails_set_frequency', tracksProperties );
	};

	toggleNewPostEmail = () => {
		const { siteId } = this.props;
		const tracksProperties = { site_id: siteId };

		if ( this.props.sendNewPostsByEmail ) {
			this.props.unsubscribeToNewPostEmail( siteId );
			this.props.recordTracksEvent( 'calypso_reader_post_emails_toggle_off', tracksProperties );
		} else {
			this.props.subscribeToNewPostEmail( siteId );
			this.props.recordTracksEvent( 'calypso_reader_post_emails_toggle_on', tracksProperties );
		}
	};

	toggleNewCommentEmail = () => {
		const { siteId } = this.props;
		const tracksProperties = { site_id: siteId };

		if ( this.props.sendNewCommentsByEmail ) {
			this.props.unsubscribeToNewCommentEmail( siteId );
			this.props.recordTracksEvent( 'calypso_reader_comment_emails_toggle_off', tracksProperties );
		} else {
			this.props.subscribeToNewCommentEmail( siteId );
			this.props.recordTracksEvent( 'calypso_reader_comment_emails_toggle_on', tracksProperties );
		}
	};

	toggleNewPostNotification = () => {
		const { siteId } = this.props;
		const tracksProperties = { site_id: siteId };

		if ( this.props.sendNewPostsByNotification ) {
			this.props.unsubscribeToNewPostNotifications( siteId );
			this.props.recordTracksEvent(
				'calypso_reader_post_notifications_toggle_off',
				tracksProperties
			);
		} else {
			this.props.subscribeToNewPostNotifications( siteId );
			this.props.recordTracksEvent(
				'calypso_reader_post_notifications_toggle_on',
				tracksProperties
			);
		}
	};

	render() {
		const {
			translate,
			sendNewCommentsByEmail,
			sendNewPostsByEmail,
			sendNewPostsByNotification,
			isEmailBlocked,
		} = this.props;

		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<div className="reader-site-notification-settings">
				<QueryUserSettings />
				<button
					className="reader-site-notification-settings__button"
					onClick={ this.togglePopoverVisibility }
					ref={ this.spanRef }
				>
					<Gridicon icon="cog" size={ 24 } ref={ this.iconRef } />
					<span
						className="reader-site-notification-settings__button-label"
						title={ translate( 'Notification settings' ) }
					>
						{ translate( 'Settings' ) }
					</span>
				</button>

				<ReaderPopover
					onClose={ this.closePopover }
					isVisible={ this.state.showPopover }
					context={ this.iconRef.current }
					ignoreContext={ this.spanRef.current }
					position={ 'bottom left' }
					className="reader-site-notification-settings__popout"
				>
					<div className="reader-site-notification-settings__popout-toggle">
						<CompactFormToggle
							onChange={ this.toggleNewPostNotification }
							checked={ sendNewPostsByNotification }
							wrapperClassName="reader-site-notification-settings__popout-form-toggle"
							id="reader-site-notification-settings__notifications"
						>
							{ translate( 'Notify me of new posts' ) }
						</CompactFormToggle>
						<p className="reader-site-notification-settings__popout-hint">
							{ translate( 'Receive web and mobile notifications for new posts from this site.' ) }
						</p>
					</div>
					<div
						className={
							isEmailBlocked
								? 'reader-site-notification-settings__popout-instructions'
								: 'reader-site-notification-settings__popout-toggle'
						}
					>
						{ ! isEmailBlocked && (
							<CompactFormToggle
								onChange={ this.toggleNewPostEmail }
								checked={ sendNewPostsByEmail }
								id={ 'reader-site-notification-settings__email-posts' }
							>
								{ translate( 'Email me new posts' ) }
							</CompactFormToggle>
						) }

						{ isEmailBlocked && (
							<div>
								{ translate( 'Email me new posts' ) }
								<p className="reader-site-notification-settings__popout-instructions-hint">
									{ translate(
										'You currently have email delivery turned off. Visit your {{a}}Notification Settings{{/a}} to turn it back on.',
										{
											components: {
												a: <a href="/me/notifications/subscriptions" />,
											},
										}
									) }
								</p>
							</div>
						) }
					</div>

					{ ! isEmailBlocked && sendNewPostsByEmail && (
						<SegmentedControl>
							<SegmentedControl.Item
								selected={ this.state.selected === 'instantly' }
								onClick={ this.setSelected( 'instantly' ) }
							>
								{ translate( 'Instantly' ) }
							</SegmentedControl.Item>
							<SegmentedControl.Item
								selected={ this.state.selected === 'daily' }
								onClick={ this.setSelected( 'daily' ) }
							>
								{ translate( 'Daily' ) }
							</SegmentedControl.Item>
							<SegmentedControl.Item
								selected={ this.state.selected === 'weekly' }
								onClick={ this.setSelected( 'weekly' ) }
							>
								{ translate( 'Weekly' ) }
							</SegmentedControl.Item>
						</SegmentedControl>
					) }
					{ ! isEmailBlocked && (
						<div className="reader-site-notification-settings__popout-toggle">
							<CompactFormToggle
								onChange={ this.toggleNewCommentEmail }
								checked={ sendNewCommentsByEmail }
								id="reader-site-notification-settings__email-comments"
							>
								{ translate( 'Email me new comments' ) }
							</CompactFormToggle>
						</div>
					) }
				</ReaderPopover>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	if ( ! ownProps.siteId ) {
		return {};
	}

	const follow = find( getReaderFollows( state ), { blog_ID: ownProps.siteId } );
	const deliveryMethodsEmail = get( follow, [ 'delivery_methods', 'email' ], {} );

	return {
		sendNewCommentsByEmail: deliveryMethodsEmail && !! deliveryMethodsEmail.send_comments,
		sendNewPostsByEmail: deliveryMethodsEmail && !! deliveryMethodsEmail.send_posts,
		emailDeliveryFrequency: deliveryMethodsEmail && deliveryMethodsEmail.post_delivery_frequency,
		sendNewPostsByNotification: get(
			follow,
			[ 'delivery_methods', 'notification', 'send_posts' ],
			false
		),
		isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
	};
};

export default connect( mapStateToProps, {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
	recordTracksEvent,
} )( localize( ReaderSiteNotificationSettings ) );
