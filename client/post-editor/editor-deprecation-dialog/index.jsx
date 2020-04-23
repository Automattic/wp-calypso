/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
/**
 * WordPress dependencies
 */
import { Button, Modal } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { localize } from 'i18n-calypso';
import { composeAnalytics, recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';

/**
 * Style dependencies
 */
import '@wordpress/components/build-style/style.css';
import './style.scss';

class EditorDeprecationDialog extends Component {
	static propTypes = {
		// connected properties
		translate: PropTypes.func,
		moment: PropTypes.func,
		gutenbergUrl: PropTypes.string,
		hideDialog: PropTypes.func,
		optIn: PropTypes.func,
		logClassicEditorUsed: PropTypes.func,
		siteId: PropTypes.number,
	};

	state = {
		showModal: true,
	};

	notNow = () => {
		const { logNotNow } = this.props;
		logNotNow();
		this.setState( { showModal: false } );
	};

	optInToGutenberg = () => {
		const { gutenbergUrl, optIn, siteId } = this.props;
		this.setState( { showModal: false } );
		optIn( siteId, gutenbergUrl );
	};

	render() {
		const { translate } = this.props;
		const { showModal } = this.state;

		if ( ! showModal ) {
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
				<Button onClick={ this.optInToGutenberg } isPrimary>
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
	optIn: ( siteId, gutenbergUrl ) => {
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_editor_deprecation_dialog', {
						opt_in: true,
					} )
				),
				setSelectedEditor( siteId, 'gutenberg', gutenbergUrl )
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
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );

	return {
		siteId,
		gutenbergUrl,
	};
}, mapDispatchToProps )( localize( EditorDeprecationDialog ) );
