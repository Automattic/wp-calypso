/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostRevisionsSelectedRevision, isPostRevisionsDialogVisible } from 'state/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { togglePostRevisionsDialog } from 'state/posts/revisions/actions';
import EditorRevisions from 'post-editor/editor-revisions';
import Dialog from 'components/dialog';

class PostRevisionsDialog extends PureComponent {
	static propTypes = {
		/**
		 * loadRevision is passed through from `post-editor/post-editor.jsx`
		 * @TODO untangle & reduxify
		 */
		loadRevision: PropTypes.func.isRequired,
		onClose: PropTypes.func,

		// connected to state
		isVisible: PropTypes.bool.isRequired,

		// connected to dispatch
		recordTracksEvent: PropTypes.func.isRequired,
		toggleDialog: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	componentWillMount() {
		this.toggleBodyClass( { isVisible: this.props.isVisible } );
	}

	componentWillUpdate( { isVisible } ) {
		this.toggleBodyClass( { isVisible } );
	}

	toggleBodyClass( { isVisible } ) {
		if ( ! ( typeof document === 'object' && get( document, 'body.classList' ) ) ) {
			return;
		}

		const bodyClassName = 'showing-post-revisions-dialog';
		isVisible
			? document.body.classList.add( bodyClassName )
			: document.body.classList.remove( bodyClassName );
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_editor_post_revisions_open' );
	}

	onLoadClick = () => {
		const { loadRevision, revision, toggleDialog } = this.props;
		loadRevision( revision );
		toggleDialog();
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
				label: translate( 'Load' ),
				onClick: this.onLoadClick,
			},
		];
	};

	render() {
		const { isVisible, onClose } = this.props;

		return (
			<Dialog
				buttons={ this.dialogButtons() }
				className="editor-revisions__dialog"
				isVisible={ isVisible }
				onClose={ onClose }
			>
				<EditorRevisions />
			</Dialog>
		);
	}
}

export default flow(
	localize,
	connect(
		state => ( {
			isVisible: isPostRevisionsDialogVisible( state ),
			postId: getEditorPostId( state ),
			revision: getPostRevisionsSelectedRevision( state ),
			siteId: getSelectedSiteId( state ),
		} ),
		{ recordTracksEvent, toggleDialog: togglePostRevisionsDialog }
	)
)( PostRevisionsDialog );
