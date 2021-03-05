/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow } from 'lodash';
import { Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import { getPostRevisionsSelectedRevision } from 'calypso/state/posts/selectors/get-post-revisions-selected-revision';
import { isPostRevisionsDialogVisible } from 'calypso/state/posts/selectors/is-post-revisions-dialog-visible';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	closePostRevisionsDialog,
	selectPostRevision,
} from 'calypso/state/posts/revisions/actions';
import EditorRevisions from 'calypso/post-editor/editor-revisions';
import CloseOnEscape from 'calypso/components/close-on-escape';

class PostRevisionsDialog extends PureComponent {
	static propTypes = {
		/**
		 * loadRevision is passed through from `post-editor/post-editor.jsx`
		 *
		 * TODO untangle & reduxify
		 */
		loadRevision: PropTypes.func.isRequired,

		// connected to state
		isVisible: PropTypes.bool.isRequired,

		// connected to dispatch
		closeDialog: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	UNSAFE_componentWillMount() {
		this.toggleBodyClass( { isVisible: this.props.isVisible } );
		this.props.selectPostRevision( null );
	}

	UNSAFE_componentWillUpdate( { isVisible } ) {
		this.toggleBodyClass( { isVisible } );
	}

	toggleBodyClass( { isVisible } ) {
		if ( ! ( typeof document === 'object' && get( document, 'body.classList' ) ) ) {
			return;
		}

		const bodyClassName = 'showing-post-revisions-dialog';

		if ( isVisible ) {
			document.body.classList.add( bodyClassName );
		} else {
			document.body.classList.remove( bodyClassName );
		}
	}

	onLoadClick = () => {
		const { loadRevision, revision, closeDialog } = this.props;
		loadRevision( revision );
		closeDialog();
		this.props.recordTracksEvent( 'calypso_editor_post_revisions_load_revision' );
	};

	dialogButtons = () => {
		const { postId, revision, siteId, translate } = this.props;
		return [
			{ action: 'cancel', compact: true, label: translate( 'Cancel' ) },
			{
				action: 'load',
				compact: true,
				disabled: ! ( revision && postId && siteId ),
				isPrimary: true,
				label: translate( 'Load', { context: 'Load revision in editor' } ),
				onClick: this.onLoadClick,
			},
		];
	};

	render() {
		const { isVisible, closeDialog } = this.props;

		return (
			<Dialog
				buttons={ this.dialogButtons() }
				className="editor-revisions__dialog"
				isVisible={ isVisible }
				onClose={ closeDialog }
			>
				<CloseOnEscape onEscape={ closeDialog } />
				<EditorRevisions />
			</Dialog>
		);
	}
}

export default flow(
	localize,
	connect(
		( state ) => ( {
			isVisible: isPostRevisionsDialogVisible( state ),
			postId: getEditorPostId( state ),
			revision: getPostRevisionsSelectedRevision( state ),
			siteId: getSelectedSiteId( state ),
		} ),
		{ recordTracksEvent, closeDialog: closePostRevisionsDialog, selectPostRevision }
	)
)( PostRevisionsDialog );
