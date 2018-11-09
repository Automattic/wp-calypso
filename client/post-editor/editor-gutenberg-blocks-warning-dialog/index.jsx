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

class EditorGutenbergBlocksWarningDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		postContent: PropTypes.string,
		siteId: PropTypes.number,
		gutenbergUrl: PropTypes.string,
		onSwitchToGutenberg: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
		postContent: null,
		siteId: null,
		gutenbergUrl: null,
		onSwitchToGutenberg: noop,
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

	useClassic = () => {
		this.setState( {
			forceClassic: true,
		} );
	};

	switchToGutenberg = () => {
		const { onSwitchToGutenberg, siteId, gutenbergUrl } = this.props;
		onSwitchToGutenberg( siteId, gutenbergUrl );
	};

	render() {
		const { translate } = this.props;
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
				onClick: this.useClassic,
			},
		];
		return (
			<Dialog isVisible={ isDialogVisible } buttons={ buttons } onClose={ this.useClassic }>
				<h1>{ translate( 'This post uses blocks from the new editor' ) }</h1>

				<p>
					{ translate(
						'You can continue to edit this post in the Classic Editor, but you may lose some data and formatting.'
					) }
				</p>

				<p>
					{ translate(
						'You can also check the document history and restore a version of the page from earlier.'
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

		return {
			postContent,
			siteId,
			gutenbergUrl,
		};
	},
	dispatch => ( {
		onSwitchToGutenberg: ( siteId, gutenbergUrl ) => {
			return dispatch( setSelectedEditor( siteId, 'gutenberg', gutenbergUrl ) );
		},
	} )
)( localize( EditorGutenbergBlocksWarningDialog ) );
