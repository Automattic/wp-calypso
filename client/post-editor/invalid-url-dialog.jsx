/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop, startsWith } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';
import { getSiteFragment } from 'lib/route/path';

class EditorTrashedDialog extends Component {

	static propTypes = {
		onClose: PropTypes.func,
		onSave: PropTypes.func,
	};

	static defaultProps = {
		onClose: noop,
		onSave: noop,
	};

	state = {
		isPage: startsWith( page.current, '/page/' ),
	};

	getDialogButtons() {
		const { translate } = this.props;
		const { isPage } = this.state;

		return [
			<FormButton
				key="startNewPage"
				isPrimary
				onClick={ this.startNewPage }
			>
				{ isPage ? translate( 'New Page' ) : translate( 'New Post' ) }
			</FormButton>,
			<FormButton
				key="back"
				isPrimary={ false }
				onClick={ this.props.onClose }
			>
				{ translate( 'Close' ) }
			</FormButton>
		];
	}

	startNewPage = () => {
		const siteFragment = getSiteFragment( page.current );
		const postSegment = this.state.isPage ? '/page/' : '/post/';
		page( postSegment + siteFragment );
	}

	render() {
		const { translate } = this.props;
		const { isPage } = this.state;

		return (
			<Dialog
				isVisible
				buttons={ this.getDialogButtons() }
			>
				<h1>{
					isPage
						? translate( 'Invalid Page Address' )
						: translate( 'Invalid Post Address' )
				}</h1>
				<p>{
					isPage
						? translate( 'This page cannot be found. Check the web address or start a new page.' )
						: translate( 'This post cannot be found. Check the web address or start a new post.' )
				}</p>
			</Dialog>
		);
	}
}

EditorTrashedDialog.displayName = 'EditorTrashedDialog';

export default localize( EditorTrashedDialog );
