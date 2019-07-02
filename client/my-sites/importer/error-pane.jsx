/** @format */

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
import Button from 'components/button';
import { getImporterTitleByEngineKey } from 'lib/importers/utils';

class ImporterError extends React.PureComponent {
	static displayName = 'ImporterError';
	static defaultProps = {
		retryImport: noop,
		errorData: {},
	};

	static propTypes = {
		description: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		errorData: PropTypes.object,
		retryImport: PropTypes.func,
	};

	contactSupport = event => {
		event.preventDefault();
		event.stopPropagation();
		Page( '/help' );
	};

	getEngineMismatchError = () => {
		const { actualEngine, attemptedEngine } = this.props.errorData;
		if ( actualEngine ) {
			return this.props.translate(
				'The URL you entered appears to be a %(actualEngine)s site, not a %(attemptedEngine)s site.{{br/}}{{a}}Switch to %(actualEngine)s{{/a}} or {{cs}}get help{{/cs}}.',
				{
					args: {
						actualEngine: getImporterTitleByEngineKey( actualEngine ),
						attemptedEngine: getImporterTitleByEngineKey( attemptedEngine ),
					},
					components: {
						a: <Button className="importer__error-pane is-link" onClick={ this.retryImport } />,
						br: <br />,
						cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
					},
				}
			);
		}

		return this.props.translate(
			'The URL you entered does not appear to be a %(attemptedEngine)s site.{{br/}}{{a}}Try again{{/a}} or {{cs}}get help{{/cs}}.',
			{
				args: {
					actualEngine: getImporterTitleByEngineKey( actualEngine ),
				},
				components: {
					a: <Button className="importer__error-pane is-link" onClick={ this.retryImport } />,
					br: <br />,
					cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
				},
			}
		);
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
			case 'engineMismatchError':
				actionMessage = this.getEngineMismatchError();
				break;

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

	retryImport = event => {
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
