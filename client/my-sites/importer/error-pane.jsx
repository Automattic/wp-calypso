import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import Page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
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
		fileName: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	contactSupport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		Page( '/help' );
	};

	installPlugin = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		Page( '/plugins/all-in-one-wp-migration' );
	};

	everythingImport = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		Page( addQueryArgs( { siteSlug: this.props.siteSlug }, '/setup/import' ) );
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
		const { description = '', fileName } = this.props;
		const fileExtension = fileName?.split( '.' ).pop()?.toLowerCase?.() ?? '';

		if ( fileExtension === 'wpress' ) {
			return this.props.translate(
				'%(errorDescription)s{{br/}}You have uploaded a .wpress file that works with the All-in-One WP Migration plugin. You can either {{ip}}install that plugin{{/ip}}, or {{ei}}try out Everything Import{{/ei}}. {{cs}}Still need help{{/cs}}?',
				{
					args: {
						errorDescription: description.length ? description : defaultError,
					},
					components: {
						br: <br />,
						ip: <Button className="importer__error-pane is-link" onClick={ this.installPlugin } />,
						ei: (
							<Button className="importer__error-pane is-link" onClick={ this.everythingImport } />
						),
						cs: <Button className="importer__error-pane is-link" onClick={ this.contactSupport } />,
					},
				}
			);
		}

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
