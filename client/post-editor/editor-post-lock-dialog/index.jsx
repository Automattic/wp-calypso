/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { takeOverPostLock } from 'state/posts/actions';
import { getSelectedSiteId, getPostsPath } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { isPostEditLocked, getEditedPostValue } from 'state/posts/selectors';

class EditorPostLockDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		isLocked: PropTypes.bool,
		postsPath: PropTypes.string,
		onTakeOver: PropTypes.func
	};

	static defaultProps = {
		translate: () => {},
		onTakeOver: () => {}
	};

	returnToPosts = () => {
		page( this.props.postsPath );
	};

	takeOver = () => {
		const { siteId, postId, onTakeOver } = this.props;
		onTakeOver( siteId, postId );
	};

	render() {
		const { isLocked, translate } = this.props;
		if ( ! isLocked ) {
			return null;
		}

		return (
			<Dialog
				buttons={ [
					{
						action: 'cancel',
						label: translate( 'Back to Blog Posts' ),
						onClick: this.returnToPosts
					},
					{
						action: 'confirm',
						label: translate( 'Take Over', { context: 'verb' } ),
						onClick: this.takeOver
					}
				] }
				onClose={ this.returnToPosts }
				isVisible>
				Post Being Edited
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const isLocked = isPostEditLocked( state, siteId, postId );
		const postsPath = getPostsPath( state, siteId, postType );

		return { isLocked, postsPath };
	},
	{ onTakeOver: takeOverPostLock }
)( localize( EditorPostLockDialog ) );
