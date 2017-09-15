/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { noop, startsWith } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import { getSiteFragment } from 'lib/route/path';

export default React.createClass( {

	displayName: 'EditorTrashedDialog',

	getInitialState() {
		return {
			isPage: this.isPage()
		};
	},

	isPage() {
		return startsWith( page.current, '/page/' );
	},

	getDefaultProps() {
		return {
			onClose: noop,
			onSave: noop
		};
	},

	propTypes: {
		onClose: PropTypes.func,
		onSave: PropTypes.func
	},

	getDialogButtons() {
		const newText = this.state.isPage ? this.translate( 'New Page' ) : this.translate( 'New Post' );
		return [
			<FormButton
				key="startNewPage"
				isPrimary={ true }
				onClick={ this.startNewPage }>
					{ newText }
			</FormButton>,
			<FormButton
				key="back"
				isPrimary={ false }
				onClick={ this.props.onClose }>
					{ this.translate( 'Close' ) }
			</FormButton>
		];
	},

	startNewPage() {
		const siteFragment = getSiteFragment( page.current );
		const postSegment = this.state.isPage ? '/page/' : '/post/';
		page( postSegment + siteFragment );
	},

	getStrings( isPage ) {
		if ( isPage ) {
			return {
				dialogTitle: this.translate( 'Invalid Page Address' ),
				dialogContent: this.translate( 'This page cannot be found. Check the web address or start a new page.' ),
			};
		}
		return {
			dialogTitle: this.translate( 'Invalid Post Address' ),
			dialogContent: this.translate( 'This post cannot be found. Check the web address or start a new post.' ),
		};
	},

	render() {
		const strings = this.getStrings( this.state.isPage );
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
