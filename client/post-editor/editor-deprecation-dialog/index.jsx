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
import isEditorDeprecationDialogShowing from 'state/selectors/is-editor-deprecation-dialog-showing';
import { hideEditorDeprecationDialog } from 'state/ui/editor-deprecation-dialog/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { setSelectedEditor } from 'state/selected-editor/actions';
import { localize } from 'i18n-calypso';
import { composeAnalytics, recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getEditorPostId } from 'state/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import getGutenbergEditorUrl from 'state/selectors/get-gutenberg-editor-url';
import InlineSupportLink from 'components/inline-support-link';
import { localizeUrl } from 'lib/i18n-utils';
import FormattedDate from 'components/formatted-date';
import { withLocalizedMoment } from 'components/localized-moment';

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
		optIn: PropTypes.func,
		logNotNow: PropTypes.func,
		siteId: PropTypes.number,
		isDialogShowing: PropTypes.bool,
	};

	notNow = () => {
		const { logNotNow, hideDialog } = this.props;
		logNotNow();
		hideDialog();
	};

	optInToGutenberg = () => {
		const { gutenbergUrl, optIn, siteId, hideDialog } = this.props;
		hideDialog();
		optIn( siteId, gutenbergUrl );
	};

	render() {
		const { isDialogShowing, translate } = this.props;

		if ( ! isDialogShowing ) {
			return null;
		}

		const dateFormat = this.props.moment.localeData().longDateFormat( 'LL' );

		return (
			<Modal
				title={ translate( 'The new WordPress editor is coming.' ) }
				className="editor-deprecation-dialog"
				onRequestClose={ this.notNow }
				isDismissible={ false }
				shouldCloseOnClickOutside={ false }
			>
				<div className="editor-deprecation-dialog__illustration" />

				<p className="editor-deprecation-dialog__subhead">
					{ translate(
						'Get a head start before we activate it for everyone in the near future. {{support}}Read more{{/support}}.',
						{
							components: {
								date: (
									<strong>
										<FormattedDate date="2020-07-01" format={ dateFormat } />
									</strong>
								),
								support: (
									<InlineSupportLink
										supportPostId={ 167510 }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/replacing-the-older-wordpress-com-editor-with-the-wordpress-block-editor/'
										) }
										showIcon={ false }
										tracksEvent="calypso_editor_deprecate_support_page_view"
										statsGroup="calypso_editor"
										statsName="editor_deprecate_learn_more"
									/>
								),
							},
						}
					) }
				</p>
				<Button onClick={ this.optInToGutenberg } isPrimary>
					{ translate( 'Use the WordPress editor' ) }
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
		gutenbergUrl: gutenbergUrl,
	};
}, mapDispatchToProps )( localize( withLocalizedMoment( EditorDeprecationDialog ) ) );
