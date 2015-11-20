/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import utils from 'lib/posts/utils';

export default React.createClass( {

	displayName: 'EditorRestorePostDialog',

	getDefaultProps() {
		return {
			onClose: noop,
			onRestore: noop,
			isAutosave: false
		};
	},

	propTypes: {
		post: React.PropTypes.object.isRequired,
		onClose: React.PropTypes.func,
		onRestore: React.PropTypes.func,
		isAutosave: React.PropTypes.bool
	},

	restorePost() {
		if ( this.props.isAutosave ) {
			this.props.onRestore();
		} else if ( utils.userCan( 'delete_post', this.props.post ) ) {
			this.props.onRestore( 'draft' );
		}
	},

	getDialogButtons() {
		return [
			<FormButton
				key="restore"
				isPrimary={ true }
				onClick={ this.restorePost }>
					{ this.translate( 'Restore' ) }
			</FormButton>,
			<FormButton
				key="back"
				isPrimary={ false }
				onClick={ this.props.onClose }>
					{ this.translate( 'Close' ) }
			</FormButton>
		];
	},

	getStrings() {
		if ( this.props.isAutosave ) {
			if ( utils.isPage( this.props.post ) ) {
				return {
					dialogTitle: this.translate( 'Saved Draft' ),
					dialogContent: this.translate( 'A more recent revision of this page exists. Restore?' ),
				};
			}
			return {
				dialogTitle: this.translate( 'Saved Draft' ),
				dialogContent: this.translate( 'A more recent revision of this post exists. Restore?' ),
			};
		}
		if ( utils.isPage( this.props.post ) ) {
			return {
				dialogTitle: this.translate( 'Deleted Page' ),
				dialogContent: this.translate( 'This page has been sent to the trash. Restore it to continue writing.' ),
			};
		}
		return {
			dialogTitle: this.translate( 'Deleted Post' ),
			dialogContent: this.translate( 'This post has been sent to the trash. Restore it to continue writing.' ),
		};
	},

	render() {
		const strings = this.getStrings();
		return (
			<Dialog
				isVisible={ true }
				buttons={ this.getDialogButtons() }
			>
				<h1>{ strings.dialogTitle }</h1>
				<p>{ strings.dialogContent }</p>
			</Dialog>
		);
	}
} );
