/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { find, get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle';
import ReaderPopover from 'components/reader-popover';
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';
import { subscribeToNewPostEmail, updateNewPostEmailSubscription, unsubscribeToNewPostEmail, subscribeToNewCommentEmail, unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';
import { getReaderFollows } from 'state/selectors';

class ReaderEmailSettings extends Component {
	static displayName = 'ReaderEmailSettings';
	static propTypes = {
		siteId: PropTypes.number,
		deliveryFrequency: PropTypes.string,
	};

	state = {
		showPopover: false,
		selected: this.props.deliveryFrequency,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.deliveryFrequency !== this.props.deliveryFrequency ) {
			this.setState( { selected: nextProps.deliveryFrequency } );
		}
	}

	togglePopoverVisibility = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
	};

	saveIconRef = ref => ( this.iconRef = ref );
	saveSpanRef = ref => ( this.spanRef = ref );

	setSelected = text => () => {
		const { siteId } = this.props;
		this.setState( { selected: text } );
		this.props.updateNewPostEmailSubscription( siteId, text );
	};

	toggleNewPostEmail = () => {
		const toggleSubscription = this.props.notifyOnNewPosts
			? this.props.unsubscribeToNewPostEmail
			: this.props.subscribeToNewPostEmail;

		toggleSubscription( this.props.siteId );
	};

	toggleNewCommentEmail = () => {
		const toggleSubscription = this.props.notifyOnNewComments
			? this.props.unsubscribeToNewCommentEmail
			: this.props.subscribeToNewCommentEmail;

		toggleSubscription( this.props.siteId );
	};

	render() {
		const { translate, notifyOnNewComments, notifyOnNewPosts } = this.props;

		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<div className="reader-email-settings">
				<span
					className="reader-email-settings__button"
					onClick={ this.togglePopoverVisibility }
					ref={ this.saveSpanRef }
				>
					<Gridicon icon="cog" size={ 24 } ref={ this.saveIconRef } />
					<span
						className="reader-email-settings__button-label"
						title={ translate( 'Email settings' ) }
					>
						{ translate( 'Settings' ) }
					</span>
				</span>

				<ReaderPopover
					onClose={ this.closePopover }
					isVisible={ this.state.showPopover }
					context={ this.iconRef }
					ignoreContext={ this.spanRef }
					position={ 'bottom left' }
					className="reader-email-settings__popout"
					popoverTitle={ translate( 'Email me' ) }
				>
					<div className="reader-email-settings__popout-toggle">
						{ translate( 'New posts' ) }
						<FormToggle onChange={ this.toggleNewPostEmail } checked={ notifyOnNewPosts } />
					</div>
					{ notifyOnNewPosts && (
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
					) }
					<div className="reader-email-settings__popout-toggle">
						{ translate( 'New comments' ) }
						<FormToggle onChange={ this.toggleNewCommentEmail } checked={ notifyOnNewComments } />
					</div>
				</ReaderPopover>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const follow = find( getReaderFollows( state ), { blog_ID: ownProps.siteId } );
	const deliveryMethods = get( follow, [ 'delivery_methods', 'email' ], {} );
	const { send_posts, post_delivery_frequency, send_comments } = deliveryMethods;

	return {
		notifyOnNewComments: !! send_comments,
		notifyOnNewPosts: !! send_posts,
		deliveryFrequency: post_delivery_frequency,
	};
};

export default connect( mapStateToProps, {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
	updateNewPostEmailSubscription,
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
} )( localize( ReaderEmailSettings ) );
