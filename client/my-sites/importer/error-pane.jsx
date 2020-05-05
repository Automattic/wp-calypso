/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Page from 'page';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { Button } from '@automattic/components';

class ImporterError extends React.PureComponent {
	static displayName = 'ImporterError';
	static defaultProps = {
		retryImport: noop,
	};

	static propTypes = {
		description: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		retryImport: PropTypes.func,
	};

	contactSupport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		Page( '/help' );
	};

	getImportError = () => {
		return this.props.translate(
			'%(errorDescription)s{{br/}}{{a}}Try again{{/a}} or {{cs}}get help{{/cs}}.',
			{
				args: {
					errorDescription: this.props.description,
				},
				components: {
					a: <Button className="importer__error-pane is-link" onClick={ this.retryImport } />,
					br: <br />,
					cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
				},
			}
		);
	};

	getUploadError = () => {
		const defaultError = this.props.translate(
			'Oops! We ran into an unexpected error while uploading your file.'
		);
		const { description = '' } = this.props;

		return this.props.translate(
			'%(errorDescription)s{{br/}}Make sure you are using a valid WordPress export file in XML or ZIP format. {{cs}}Still need help{{/cs}}?',
			{
				args: {
					errorDescription: description.length ? description : defaultError,
				},
				components: {
					br: <br />,
					cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
				},
			}
		);
	};

	getErrorMessage = () => {
		let actionMessage;

		switch ( this.props.type ) {
			case 'uploadError':
				actionMessage = this.getUploadError();
				break;

			case 'importError':
				actionMessage = this.getImportError();
				break;

			case 'validationError':
				actionMessage = this.props.description
					? this.props.description
					: this.props.translate( 'Data you entered are not valid' );
				break;
		}

		return actionMessage;
	};

	retryImport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.retryImport();
	};

	render() {
		return (
			<div>
				<Notice status="is-error" text={ this.getErrorMessage() } showDismiss={ false } />
			</div>
		);
	}
}

export default localize( ImporterError );
