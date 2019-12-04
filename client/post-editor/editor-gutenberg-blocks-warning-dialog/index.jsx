/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getEditorRawContent, getEditorPostId } from 'state/ui/editor/selectors';
import { Dialog } from '@automattic/components';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
	withAnalytics,
	bumpStat,
} from 'state/analytics/actions';
import isGutenbergOptInEnabled from 'state/selectors/is-gutenberg-opt-in-enabled';

/**
 * Style dependencies
 */
import './style.scss';

class EditorGutenbergBlocksWarningDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		postContent: PropTypes.string,
		siteId: PropTypes.number,
		gutenbergUrl: PropTypes.string,
		switchToGutenberg: PropTypes.func,
		openPostRevisionsDialog: PropTypes.func,
		optInEnabled: PropTypes.bool,
		useClassic: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
		postContent: null,
		siteId: null,
		gutenbergUrl: null,
		switchToGutenberg: noop,
		openPostRevisionsDialog: noop,
		optInEnabled: false,
		useClassic: noop,
	};

	state = {
		isDialogVisible: false,
		forceClassic: false,
	};

	shouldComponentUpdate( nextProps, nextState ) {
		return this.state.isDialogVisible !== nextState.isDialogVisible;
	}

	static getDerivedStateFromProps( props, state ) {
		const { postContent } = props;
		const { forceClassic } = state;

		const hasGutenbergBlocks = content => !! content && content.indexOf( '<!-- wp:' ) !== -1;

		const isDialogVisible = ! forceClassic && hasGutenbergBlocks( postContent );

		return {
			isDialogVisible,
		};
	}

	useClassicEditor = () => {
		this.props.useClassic();
		this.setState( {
			forceClassic: true,
		} );
	};

	switchToGutenberg = () => {
		const { switchToGutenberg, siteId, gutenbergUrl } = this.props;
		switchToGutenberg( siteId, gutenbergUrl );
	};

	showDocumentHistory = e => {
		e.preventDefault();
		this.props.openPostRevisionsDialog();
		this.useClassicEditor();
	};

	render() {
		const { translate, optInEnabled } = this.props;

		if ( ! optInEnabled ) {
			return null;
		}

		const { isDialogVisible } = this.state;
		const buttons = [
			{
				action: 'gutenberg',
				label: translate( 'Switch to the new editor' ),
				onClick: this.switchToGutenberg,
				isPrimary: true,
			},
			{
				action: 'cancel',
				label: translate( 'Use the classic editor' ),
				onClick: this.useClassicEditor,
			},
		];
		return (
			<Dialog
				additionalClassNames="editor-gutenberg-blocks-warning-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.useClassicEditor }
			>
				<h1>{ translate( 'This post uses blocks from the new editor' ) }</h1>

				<p>
					{ translate(
						'You can continue to edit this post in the Classic Editor, but you may lose some data and formatting. You can also check the {{a}}document history{{/a}} and restore a version of the page from earlier.',
						{
							components: {
								//eslint-disable-next-line jsx-a11y/anchor-is-valid
								a: <a href="#" onClick={ this.showDocumentHistory } />,
							},
						}
					) }
				</p>
			</Dialog>
		);
	}
}

const mapDispatchToProps = dispatch => ( {
	switchToGutenberg: ( siteId, gutenbergUrl ) => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordGoogleEvent(
						'Gutenberg Opt-In',
						'Clicked "Switch to the new editor" in the blocks warning dialog.',
						'Opt-In',
						true
					),
					recordTracksEvent( 'calypso_gutenberg_opt_in', {
						opt_in: true,
					} ),
					bumpStat( 'gutenberg-opt-in', 'Calypso Dialog Opt In' )
				),
				setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
			)
		);
	},
	useClassic: () => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordGoogleEvent(
						'Gutenberg Opt-Out',
						'Clicked "Use the classic editor" in the blocks warning dialog.',
						'Opt-In',
						false
					),
					recordTracksEvent( 'calypso_gutenberg_use_classic_editor' ),
					bumpStat( 'selected-editor', 'calypso-gutenberg-use-classic-editor' )
				)
			)
		);
	},
	openPostRevisionsDialog: () => dispatch( openPostRevisionsDialog() ),
} );

export default connect( state => {
	const postContent = getEditorRawContent( state );
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );
	const optInEnabled = isGutenbergOptInEnabled( state, siteId );

	return {
		postContent,
		siteId,
		gutenbergUrl,
		optInEnabled,
	};
}, mapDispatchToProps )( localize( EditorGutenbergBlocksWarningDialog ) );
