/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import isEditorDeprecationDialogShowing from 'state/selectors/is-editor-deprecation-dialog-showing';
import { hideEditorDeprecationDialog } from 'state/ui/editor-deprecation-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import { composeAnalytics, recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import { addQueryArgs } from 'lib/url';

/**
 * Style dependencies
 */
import '@wordpress/components/build-style/style.css';
import './style.scss';

class EditorDeprecationDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		gutenbergUrl: PropTypes.string,
		hideDialog: PropTypes.func,
		logTryNow: PropTypes.func,
		logNotNow: PropTypes.func,
		siteId: PropTypes.number,
		isDialogShowing: PropTypes.bool,
	};

	notNow = () => {
		const { logNotNow, hideDialog } = this.props;
		logNotNow();
		hideDialog();
	};

	trialGutenberg = () => {
		const { gutenbergUrl, logTryNow, hideDialog } = this.props;
		logTryNow();
		hideDialog();

		page.redirect( gutenbergUrl );
	};

	render() {
		const { isDialogShowing, translate } = this.props;

		if ( ! isDialogShowing ) {
			return null;
		}

		return (
			<Modal
				title={ translate( 'The Block Editor is coming.' ) }
				className="editor-deprecation-dialog"
				onRequestClose={ this.notNow }
				isDismissible={ false }
				shouldCloseOnClickOutside={ false }
			>
				<div className="editor-deprecation-dialog__illustration" />

				<p className="editor-deprecation-dialog__subhead">
					{ translate(
						'Try the Block Editor now before we enable it for everyone on {{date/}}. {{a}}Read more here{{/a}}.',
						{
							components: {
								a: <a href="https://DOCS/" target="_blank" rel="noopener noreferrer" />,
								date: <strong>{ translate( 'June 15' ) }</strong>,
							},
						}
					) }
				</p>
				<Button onClick={ this.trialGutenberg } isPrimary>
					{ translate( 'Try it out' ) }
				</Button>
				<Button onClick={ this.notNow } isLink>
					{ translate( 'Not now' ) }
				</Button>
			</Modal>
		);
	}
}

const mapDispatchToProps = ( dispatch ) => ( {
	logTryNow: () => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_editor_deprecation_dialog', {
						opt_in: true,
					} )
				)
			)
		);
	},
	logNotNow: () => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_editor_deprecation_dialog', {
						opt_in: false,
					} )
				)
			)
		);
	},
	hideDialog: () => dispatch( hideEditorDeprecationDialog() ),
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const isDialogShowing = isEditorDeprecationDialogShowing( state );
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );

	return {
		siteId,
		isDialogShowing,
		gutenbergUrl: addQueryArgs( { 'trial-editor': 1 }, gutenbergUrl ),
	};
}, mapDispatchToProps )( localize( EditorDeprecationDialog ) );
