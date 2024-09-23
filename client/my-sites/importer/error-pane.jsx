import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { WPImportError, FileTooLarge } from 'calypso/blocks/importer/wordpress/types';
import Notice from 'calypso/components/notice';
import { addQueryArgs } from 'calypso/lib/route';

const noop = () => {};

class ImporterError extends PureComponent {
	static displayName = 'ImporterError';
	static defaultProps = {
		retryImport: noop,
	};

	static propTypes = {
		description: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		retryImport: PropTypes.func,
		siteSlug: PropTypes.string,
		code: PropTypes.string,
		importerEngine: PropTypes.string,
	};

	contactSupport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		window.location.href = '/help';
	};

	installPlugin = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		window.location.href = '/plugins/all-in-one-wp-migration';
	};

	everythingImport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		window.location.href = addQueryArgs(
			{ siteSlug: this.props.siteSlug },
			'/setup/site-setup/import'
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

		if ( isEnabled( 'importer/site-backups' ) && this.props.importerEngine === 'wordpress' ) {
			return this.props.translate(
				'The file type you uploaded is not supported. Please upload a WordPress export file in XML or ZIP format, or a Playground ZIP file. {{cs}}Still need help{{/cs}}?',
				{
					components: {
						cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
					},
				}
			);
		}

		return this.props.translate(
			'%(errorDescription)s{{br/}}Make sure you are using a valid export file in XML or ZIP format. {{cs}}Still need help{{/cs}}?',
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

	getPreUploadError = () => {
		const defaultError = this.props.translate(
			'Oops! We ran into an unexpected error while uploading your file.'
		);

		if ( this.props.code === WPImportError.WPRESS_FILE_IS_NOT_SUPPORTED ) {
			return this.props.translate(
				'You have uploaded a .wpress file that works with the All-in-One WP Migration plugin. You can either {{ip}}install that plugin{{/ip}}, or {{ei}}try out Everything Import{{/ei}}. {{cs}}Still need help{{/cs}}?',
				{
					components: {
						ip: <Button className="importer__error-pane is-link" onClick={ this.installPlugin } />,
						ei: (
							<Button className="importer__error-pane is-link" onClick={ this.everythingImport } />
						),
						cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
					},
				}
			);
		}

		if ( this.props.code === FileTooLarge.FILE_TOO_LARGE ) {
			return this.props.translate(
				'The file you are importing is too large. {{cs}}Please contact support to continue{{/cs}}.',
				{
					components: {
						cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
					},
				}
			);
		}

		return defaultError;
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

			case 'preUploadError':
				actionMessage = this.getPreUploadError();
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
