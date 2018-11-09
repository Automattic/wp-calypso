/** @format */

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
import Dialog from 'components/dialog';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { openPostRevisionsDialog } from 'state/posts/revisions/actions';
import { isEnabled } from 'config';
import { isJetpackSite } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';

class EditorGutenbergBlocksWarningDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		postContent: PropTypes.string,
		siteId: PropTypes.number,
		gutenbergUrl: PropTypes.string,
		switchToGutenberg: PropTypes.func,
		openPostRevisionsDialog: PropTypes.func,
		isGutenbergEnabled: PropTypes.bool,
	};

	static defaultProps = {
		translate: identity,
		postContent: null,
		siteId: null,
		gutenbergUrl: null,
		switchToGutenberg: noop,
		openPostRevisionsDialog: noop,
		isGutenbergEnabled: false,
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
		const { translate, isGutenbergEnabled } = this.props;

		if ( ! isGutenbergEnabled ) {
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
			<Dialog isVisible={ isDialogVisible } buttons={ buttons } onClose={ this.useClassicEditor }>
				<h1>{ translate( 'This post uses blocks from the new editor' ) }</h1>

				<p>
					{ translate(
						'You can continue to edit this post in the Classic Editor, but you may lose some data and formatting.'
					) }
				</p>

				<p>
					{ translate(
						'You can also check the {{a}}document history{{/a}} and restore a version of the page from earlier.',
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

export default connect(
	state => {
		const postContent = getEditorRawContent( state );
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );
		const isVip = isVipSite( state, siteId );
		const isJetpack = isJetpackSite( state, siteId );
		const isGutenbergEnabled = isEnabled( 'gutenberg/opt-in' ) && ! isJetpack && ! isVip;

		return {
			postContent,
			siteId,
			gutenbergUrl,
			isGutenbergEnabled,
		};
	},
	dispatch => ( {
		switchToGutenberg: ( siteId, gutenbergUrl ) =>
			dispatch( setSelectedEditor( siteId, 'gutenberg', gutenbergUrl ) ),
		openPostRevisionsDialog: () => dispatch( openPostRevisionsDialog() ),
	} )
)( localize( EditorGutenbergBlocksWarningDialog ) );
