/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FeedbackSidebarHeader from './feedback-header';
import FeedbackRequestForm from './feedback-request-form';
import FeedbackShare from './feedback-share';
import SidebarFooter from 'layout/sidebar/footer';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getDraftFeedbackShares } from 'state/selectors';
import { addDraftShare, revokeDraftShare, restoreDraftShare } from 'state/draft-feedback/actions';

// TODO: Find a clearer word than "share" for the owner of feedback and use it in subcomponent and CSS classes
export class FeedbackView extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		close: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		shares: PropTypes.array.isRequired,
		addDraftShare: PropTypes.func.isRequired,
	};

	state = {
		// The number of FeedbackShare components that are toggled open in the UI
		totalOpenedShares: 0,
	};

	onToggleShare = isToggledOpen => {
		const { totalOpenedShares } = this.state;

		this.setState( {
			totalOpenedShares: isToggledOpen ? totalOpenedShares + 1 : totalOpenedShares - 1,
		} );
	};

	onAddDraftShare = emailAddress => {
		const { postId, siteId } = this.props;
		this.props.addDraftShare( siteId, postId, emailAddress );
	};

	onRevokeShareAccess = emailAddress => {
		const { postId, siteId } = this.props;
		this.props.revokeDraftShare( siteId, postId, emailAddress );
	};

	onRestoreShareAccess = emailAddress => {
		const { postId, siteId } = this.props;
		this.props.restoreDraftShare( siteId, postId, emailAddress );
	};

	render() {
		const { shares, translate } = this.props;
		const allSharesClosed = this.state.totalOpenedShares === 0;

		return (
			<div className="editor-sidebar__view">
				<FeedbackSidebarHeader closeFeedback={ this.props.close } />
				{ allSharesClosed &&
					<div>
						<div className="editor-sidebar__feedback-header-image-box" />
						<FeedbackRequestForm requestFeedback={ this.onAddDraftShare } />
					</div> }
				{ shares.length > 0 &&
					<div>
						<div
							className={ classNames( {
								'editor-sidebar__feedback-list-label': true,
								'is-hidden': ! allSharesClosed,
							} ) }
						>
							{ translate( 'Friends' ) }
						</div>
						{ shares.map( share =>
							<FeedbackShare
								key={ share.emailAddress }
								share={ share }
								onToggle={ this.onToggleShare }
								onRevokeAccess={ this.onRevokeShareAccess }
								onRestoreAccess={ this.onRestoreShareAccess }
							/>,
						) }
					</div> }
				<SidebarFooter />
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const shares = getDraftFeedbackShares( state, siteId, postId );

		return { siteId, postId, shares };
	},
	dispatch =>
		bindActionCreators(
			{
				addDraftShare,
				revokeDraftShare,
				restoreDraftShare,
			},
			dispatch,
		),
)( localize( FeedbackView ) );
