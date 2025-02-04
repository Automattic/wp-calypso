import { Reader } from '@automattic/data-stores';
import { Button, ToggleControl } from '@wordpress/components';
import { Icon, settings } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { find, get } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import Settings from 'calypso/assets/images/icons/settings.svg';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import FormSelect from 'calypso/components/forms/form-select';
import SVGIcon from 'calypso/components/svg-icon';
import ReaderPopover from 'calypso/reader/components/reader-popover';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	subscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	unsubscribeToNewPostEmail,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from 'calypso/state/reader/follows/actions';
import { getReaderFollows } from 'calypso/state/reader/follows/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

import './style.scss';

class ReaderSiteNotificationSettings extends Component {
	static displayName = 'ReaderSiteNotificationSettings';
	static propTypes = {
		iconSize: PropTypes.number,
		showLabel: PropTypes.bool,
		siteId: PropTypes.number,
		subscriptionId: PropTypes.number,
	};

	static defaultProps = {
		iconSize: 20,
		showLabel: true,
	};

	state = { showPopover: false };

	iconRef = createRef();
	spanRef = createRef();

	getAvailableFrequencies = () => {
		const { translate } = this.props;
		return [
			{
				value: Reader.EmailDeliveryFrequency.Instantly,
				label: translate( 'Instantly' ),
			},
			{
				value: Reader.EmailDeliveryFrequency.Daily,
				label: translate( 'Daily' ),
			},
			{
				value: Reader.EmailDeliveryFrequency.Weekly,
				label: translate( 'Weekly' ),
			},
		];
	};

	togglePopoverVisibility = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
	};

	setSelected = ( text ) => {
		const { siteId } = this.props;
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
			emailDeliveryFrequency,
			sendNewCommentsByEmail,
			sendNewPostsByEmail,
			sendNewPostsByNotification,
			isEmailBlocked,
			subscriptionId,
		} = this.props;

		const availableFrequencies = this.getAvailableFrequencies();
		const selectedFrequency = availableFrequencies.find(
			( option ) => option.value === emailDeliveryFrequency
		);

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
					aria-label={ translate( 'Notification settings' ) }
				>
					<SVGIcon
						classes="reader-following-feed"
						name="settings"
						size={ this.props.iconSize }
						icon={ Settings }
						ref={ this.iconRef }
					/>
					{ this.props.showLabel && (
						<span
							className="reader-site-notification-settings__button-label"
							title={ translate( 'Notification settings' ) }
						>
							{ translate( 'Settings' ) }
						</span>
					) }
				</button>

				<ReaderPopover
					onClose={ this.closePopover }
					isVisible={ this.state.showPopover }
					context={ this.iconRef.current }
					ignoreContext={ this.spanRef.current }
					position="bottom left"
					className="reader-site-notification-settings__popout"
				>
					<div className="reader-site-notification-settings__popout-toggle">
						<ToggleControl
							onChange={ this.toggleNewPostNotification }
							checked={ sendNewPostsByNotification }
							id="reader-site-notification-settings__notifications"
							label={ translate( 'Notify me of new posts' ) }
						/>
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
							<ToggleControl
								onChange={ this.toggleNewPostEmail }
								checked={ sendNewPostsByEmail }
								id="reader-site-notification-settings__email-posts"
								label={ translate( 'Email me new posts' ) }
							/>
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
						<div className="reader-site-notification-settings__popout-select">
							<FormSelect
								value={ selectedFrequency?.value }
								onChange={ ( event ) => this.setSelected( event.target.value ) }
							>
								{ availableFrequencies.map( ( option ) => (
									<option key={ option.value } value={ option.value }>
										{ option.label }
									</option>
								) ) }
							</FormSelect>
						</div>
					) }

					{ ! isEmailBlocked && (
						<div className="reader-site-notification-settings__popout-toggle">
							<ToggleControl
								onChange={ this.toggleNewCommentEmail }
								checked={ sendNewCommentsByEmail }
								id="reader-site-notification-settings__email-comments"
								label={ translate( 'Email me new comments' ) }
							/>
						</div>
					) }

					{ subscriptionId && (
						<Button
							className="reader-site-notification-settings__manage-subscription-button"
							icon={
								<Icon
									className="subscriptions-ellipsis-menu__item-icon"
									size={ 20 }
									icon={ settings }
								/>
							}
							href={ `/reader/subscriptions/${ subscriptionId }` }
						>
							{ translate( 'Manage subscription' ) }
						</Button>
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
