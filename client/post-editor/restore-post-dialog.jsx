/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorRestorePostDialog extends Component {
	static propTypes = {
		translate: PropTypes.func,
		onClose: PropTypes.func,
		onRestore: PropTypes.func,
		isAutosave: PropTypes.bool,
		postType: PropTypes.string,
	};

	static defaultProps = {
		onClose: noop,
		onRestore: noop,
		isAutosave: false,
	};

	getStrings = () => {
		const { isAutosave, postType, translate } = this.props;
		const isPage = postType === 'page';
		if ( isAutosave ) {
			if ( isPage ) {
				return {
					dialogTitle: translate( 'Saved Draft' ),
					dialogContent: translate( 'A more recent revision of this page exists. Restore?' ),
				};
			}
			return {
				dialogTitle: translate( 'Saved Draft' ),
				dialogContent: translate( 'A more recent revision of this post exists. Restore?' ),
			};
		}
		if ( isPage ) {
			return {
				dialogTitle: translate( 'Deleted Page' ),
				dialogContent: translate(
					'This page has been sent to the trash. Restore it to continue writing.'
				),
			};
		}
		return {
			dialogTitle: translate( 'Deleted Post' ),
			dialogContent: translate(
				'This post has been sent to the trash. Restore it to continue writing.'
			),
		};
	};

	render() {
		const { onClose, onRestore, translate } = this.props;
		const strings = this.getStrings();

		const dialogButtons = [
			<FormButton key="restore" isPrimary={ true } onClick={ onRestore }>
				{ translate( 'Restore' ) }
			</FormButton>,
			<FormButton key="back" isPrimary={ false } onClick={ onClose }>
				{ translate( "Don't restore" ) }
			</FormButton>,
		];

		return (
			<Dialog isVisible={ true } buttons={ dialogButtons }>
				<h1>{ strings.dialogTitle }</h1>
				<p>{ strings.dialogContent }</p>
			</Dialog>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const postType = getEditedPostValue( state, siteId, postId, 'type' );
	return { postType };
} )( localize( EditorRestorePostDialog ) );
