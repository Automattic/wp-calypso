/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { noop, startsWith } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import { getSiteFragment } from 'lib/route';

class EditorTrashedDialog extends React.Component {
	static displayName = 'EditorTrashedDialog';

	static defaultProps = {
		onClose: noop,
	};

	static propTypes = {
		onClose: PropTypes.func,
	};

	state = {
		isPage: this.isPage(),
	};

	isPage() {
		return startsWith( page.current, '/page/' );
	}

	getDialogButtons() {
		const newText = this.state.isPage
			? this.props.translate( 'New Page' )
			: this.props.translate( 'New Post' );
		return [
			<FormButton key="startNewPage" isPrimary={ true } onClick={ this.startNewPage }>
				{ newText }
			</FormButton>,
			<FormButton key="back" isPrimary={ false } onClick={ this.props.onClose }>
				{ this.props.translate( 'Close' ) }
			</FormButton>,
		];
	}

	startNewPage = () => {
		const siteFragment = getSiteFragment( page.current );
		const postSegment = this.state.isPage ? '/page/' : '/post/';
		page( postSegment + siteFragment );
	};

	getStrings( isPage ) {
		if ( isPage ) {
			return {
				dialogTitle: this.props.translate( 'Invalid Page Address' ),
				dialogContent: this.props.translate(
					'This page cannot be found. Check the web address or start a new page.'
				),
			};
		}
		return {
			dialogTitle: this.props.translate( 'Invalid Post Address' ),
			dialogContent: this.props.translate(
				'This post cannot be found. Check the web address or start a new post.'
			),
		};
	}

	render() {
		const strings = this.getStrings( this.state.isPage );
		return (
			<Dialog isVisible={ true } buttons={ this.getDialogButtons() }>
				<h1>{ strings.dialogTitle }</h1>
				<p>{ strings.dialogContent }</p>
			</Dialog>
		);
	}
}

export default localize( EditorTrashedDialog );
