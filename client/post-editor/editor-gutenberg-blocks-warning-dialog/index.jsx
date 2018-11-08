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
import isGutenbergBlocksWarningDialogShowing from 'state/selectors/is-gutenberg-blocks-warning-dialog-showing';
import { hideGutenbergBlocksWarningDialog } from 'state/ui/gutenberg-blocks-warning-dialog/actions';
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Dialog from 'components/dialog';

class EditorGutenbergBlocksWarningDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		isDialogVisible: PropTypes.bool,
		hideDialog: PropTypes.func,
	};

	onCloseDialog = () => {
		this.props.hideDialog();
	};

	render() {
		const { translate, isDialogVisible } = this.props;
		const buttons = [
			<Button key="gutenberg" onClick={ () => {} } primary>
				{ translate( 'Switch to the new editor' ) }
			</Button>,
			{
				action: 'cancel',
				label: translate( 'Use the classic editor' ),
				onClick: () => {},
			},
		];
		return (
			<Dialog
				additionalClassNames="editor-gutenberg-blocks-warning-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
			>
				<header>
					<button
						onClick={ this.onCloseDialog }
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
	state => {
		const isDialogVisible = isGutenbergBlocksWarningDialogShowing( state );

		return {
			isDialogVisible,
		};
	},
	mapDispatchToProps
)( localize( EditorGutenbergBlocksWarningDialog ) );
