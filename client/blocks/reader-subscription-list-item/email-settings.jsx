/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import Popover from 'components/popover/index';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import FormToggle from 'components/forms/form-toggle';
import { getReaderFollows } from 'state/selectors';
import {
	subscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	unsubscribeToNewPostEmail,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
} from 'state/reader/follows/actions';

class ReaderEmailSubscriptionSettingsPopout extends Component {
	static displayName = 'ReaderEmailSubscriptionSettingsPopout';
	static propTypes = {
		siteId: PropTypes.number,
	};

	state = {
		showPopover: false,
	};

	togglePopoverVisibility = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	}

	closePopover = () => {
		this.setState( { showPopover: false } );
	}

	savePopoutSpanRef = spanRef => {
		this.spanRef = spanRef;
	}

	setSelected = text => () => {
		const { siteId } = this.props;
		this.setState( { selected: text } );
		this.props.updateNewPostEmailSubscription( siteId, text );
	}

	toggleNewPostEmail = () => {
		const { notifyOnNewPosts, siteId } = this.props;

		if ( notifyOnNewPosts ) {
			this.props.unsubscribeToNewPostEmail( siteId );
		} else {
			this.props.subscribeToNewPostEmail( siteId );
		}
	}

	toggleNewCommentEmail = () => {
		const { notifyOnNewComments, siteId } = this.props;

		if ( notifyOnNewComments ) {
			this.props.unsubscribeToNewCommentEmail( siteId );
		} else {
			this.props.subscribeToNewCommentEmail( siteId );
		}
	}

	render() {
		const { translate, notifyOnNewComments, notifyOnNewPosts } = this.props;

		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<div>
				<span
					className="reader-subscription-list-item__settings-menu"
					onClick={ this.togglePopoverVisibility }
					ref={ this.savePopoutSpanRef }
				>
					<Gridicon icon="cog" size={ 24 } />
					<span className="reader-subscription-list-item__settings-label">Settings</span>
				</span>

				<Popover
					onClose={ this.closePopover }
					isVisible={ this.state.showPopover }
					context={ this.spanRef }
					position={ 'bottom left' }
					className="reader-subscription-list-item__settings-menu-popout"
				>
					<div className="reader-subscription-list-item__email-popout-wrapper">
						<h3 className="reader-subscription-list-item__email-popout-header">
							{ translate( 'Email me' ) }
						</h3>
						<div className="reader-subscription-list-item__email-popout-toggle">
							{ translate( 'New posts' ) }
							<FormToggle
								onChange={ this.toggleNewPostEmail }
								checked={ notifyOnNewPosts }
							/>
						</div>
						<SegmentedControl>
							<ControlItem
								selected={ this.state.selected === 'instantly' }
								onClick={ this.setSelected( 'instantly' ) }
							>
								{ translate( 'Instantly' ) }
							</ControlItem>
							<ControlItem
								selected={ this.state.selected === 'daily' }
								onClick={ this.setSelected( 'daily' ) }
							>
								{ translate( 'Daily' ) }
							</ControlItem>
							<ControlItem
								selected={ this.state.selected === 'weekly' }
								onClick={ this.setSelected( 'weekly' ) }
							>
								{ translate( 'Weekly' ) }
							</ControlItem>
						</SegmentedControl>
						<div className="reader-subscription-list-item__email-popout-toggle">
							New comments
							<FormToggle
								onChange={ this.toggleNewCommentEmail }
								checked={ notifyOnNewComments }
							/>
						</div>
					</div>
				</Popover>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const follow = find( getReaderFollows( state ), { blog_ID: ownProps.siteId } );

	const currentDeliveryMethods = get( follow, [ 'delivery_methods', 'email' ], {} );
	const notifyOnNewPosts = !! currentDeliveryMethods.send_posts;
	const deliveryFrequency = currentDeliveryMethods.post_delivery_frequency;
	const notifyOnNewComments = !! currentDeliveryMethods.send_comments;

	return {
		notifyOnNewComments,
		notifyOnNewPosts,
		deliveryFrequency
	};
};

export default connect(
	mapStateToProps,
	{
		subscribeToNewPostEmail,
		unsubscribeToNewPostEmail,
		updateNewPostEmailSubscription,
		subscribeToNewCommentEmail,
		unsubscribeToNewCommentEmail,
	}
)( localize( ReaderEmailSubscriptionSettingsPopout ) );

