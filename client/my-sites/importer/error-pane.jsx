/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Page from 'page';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

class SiteSettingsImporterError extends React.PureComponent {
	static displayName = 'SiteSettingsImporterError';

	static propTypes = {
		description: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
	};

	contactSupport = event => {
		event.preventDefault();
		event.stopPropagation();
		Page( '/help' );
	};

	getImportError = () => {
		return this.props.translate(
			'%(errorDescription)s{{br/}}{{a}}Try again{{/a}} or {{cs}}contact support{{/cs}}.',
			{
				args: {
					errorDescription: this.props.description,
				},
				components: {
					a: <a href="#" onClick={ this.retryImport } />,
					br: <br />,
					cs: <a href="#" onClick={ this.contactSupport } />,
				},
			}
		);
	};

	getUploadError = () => {
		const defaultError = this.props.translate( 'Unexpected error during the upload' );
		const { description = '' } = this.props;

		return this.props.translate(
			'%(errorDescription)s{{br/}}Try another file or {{cs}}contact support{{/cs}}.',
			{
				args: {
					errorDescription: description.length ? description : defaultError,
				},
				components: {
					br: <br />,
					cs: <a href="#" onClick={ this.contactSupport } />,
				},
			}
		);
	};

	getErrorMessage = () => {
		var actionMessage;

		switch ( this.props.type ) {
			case 'uploadError':
				actionMessage = this.getUploadError();
				break;

			case 'importError':
				actionMessage = this.getImportError();
				break;
		}

		return actionMessage;
	};

	retryImport = event => {
		event.preventDefault();
		event.stopPropagation();
	};

	render() {
		return (
			<div>
				<Notice status="is-error" text={ this.getErrorMessage() } showDismiss={ false } />
			</div>
		);
	}
}

export default localize( SiteSettingsImporterError );
