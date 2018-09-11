/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import getCurrentRoute from 'state/selectors/get-current-route';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import isGutenbergOptInDialogShowing from 'state/selectors/is-gutenberg-opt-in-dialog-showing';
import { hideGutenbergOptInDialog } from 'state/ui/gutenberg-opt-in-dialog/actions';
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Dialog from 'components/dialog';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

class EditorGutenbergOptInDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		gutenbergURL: PropTypes.string,
		isDialogVisible: PropTypes.bool,
		hideGutenbergOptInDialog: PropTypes.func,
	};

	recordOptInStats( closeDialog ) {
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-In',
				'Clicked "Try the new editor" in the editor opt-in sidebar.',
				'Opt-In',
				true
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: true,
			} )
		);
		closeDialog();
	}

	recordOptOutStats( closeDialog ) {
		composeAnalytics(
			recordGoogleEvent(
				'Gutenberg Opt-In',
				'Clicked "Use the classic editor" in the editor opt-in sidebar.',
				'Opt-In',
				false
			),
			recordTracksEvent( 'calypso_gutenberg_opt_in', {
				opt_in: false,
			} )
		);
		closeDialog();
	}

	render() {
		const { translate, gutenbergURL, isDialogVisible } = this.props;
		const buttons = [
			<Button key="gutenberg" href={ gutenbergURL } onClick={ this.recordOptInStats } primary>
				{ translate( 'Try the new editor' ) }
			</Button>,
			{
				action: 'cancel',
				label: translate( 'Use the classic editor' ),
				onClick: this.recordOptOutStats,
			},
		];
		return (
			<Dialog
				additionalClassNames="editor-gutenberg-opt-in-dialog"
				isVisible={ isDialogVisible }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
			>
				<div className="editor-gutenberg-opt-in-dialog__illustration" />

				<header>
					<button onClick={ this.onCloseDialog } className="editor-gutenberg-opt-in-dialog__close">
						<Gridicon icon="cross" />
					</button>
				</header>

				<h1>{ translate( 'Check out the new building blocks of the web' ) }</h1>

				<p className="editor-gutenberg-opt-in-dialog__subhead">
					{ translate(
						'A new publishing experience is coming to WordPress. The new editor lets you pick from a growing collection of blocks to build your ideal layout.'
					) }
				</p>

				<p>
					{ translate(
						'Be one of the first to try the new editor and help us make it the best publishing experience on the web.'
					) }
				</p>
			</Dialog>
		);
	}

	onCloseDialog = () => {
		this.props.hideGutenbergOptInDialog();
	};
}

export default connect(
	state => {
		const currentRoute = getCurrentRoute( state );
		const isDialogVisible = isGutenbergOptInDialogShowing( state );
		return {
			gutenbergURL: `/gutenberg${ currentRoute }`,
			isDialogVisible,
		};
	},
	{
		hideGutenbergOptInDialog,
	}
)( localize( EditorGutenbergOptInDialog ) );
