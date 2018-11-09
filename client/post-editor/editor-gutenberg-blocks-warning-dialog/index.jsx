/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getEditorRawContent } from 'state/ui/editor/selectors';
import { hideGutenbergBlocksWarningDialog } from 'state/ui/gutenberg-blocks-warning-dialog/actions';
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import { identity } from 'lodash';

class EditorGutenbergBlocksWarningDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		postContent: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		postContent: '',
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

	switchToGutenberg = () => {};

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
			<Dialog
				additionalClassNames="editor-gutenberg-blocks-warning-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.useClassic }
			>
				<header>
					<button
						onClick={ this.useClassic }
						className="editor-gutenberg-blocks-warning-dialog__close"
					>
						<Gridicon icon="cross" />
					</button>
				</header>

				<h1>{ translate( 'This post uses blocks from the new editor' ) }</h1>

				<p className="editor-gutenberg-blocks-warning-dialog__subhead">
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

const mapDispatchToProps = dispatch => ( {
	hideDialog: () => dispatch( hideGutenbergBlocksWarningDialog() ),
} );

export default connect(
	state => ( {
		postContent: getEditorRawContent( state ),
	} ),
	mapDispatchToProps
)( localize( EditorGutenbergBlocksWarningDialog ) );
