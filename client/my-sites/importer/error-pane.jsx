/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import Page from 'page';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

export default React.createClass( {
	displayName: 'SiteSettingsImporterError',

	mixins: [ PureRenderMixin ],

	propTypes: {
		description: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired
	},

	contactSupport: function( event ) {
		event.preventDefault();
		event.stopPropagation();
		Page( '/help' );
	},

	getImportError: function() {
		return this.translate(
			'%(errorDescription)s{{br/}}{{a}}Try again{{/a}} or {{cs}}contact support{{/cs}}.', {
				args: {
					errorDescription: this.props.description
				},
				components: {
					a: <a href="#" onClick={ this.retryImport } />,
					br: <br />,
					cs: <a href="#" onClick={ this.contactSupport } />
				}
			}
		);
	},

	getUploadError: function() {
		const defaultError = this.translate( 'Unexpected error during the upload' );
		const { description = '' } = this.props;

		return this.translate(
			'%(errorDescription)s{{br/}}Try another file or {{cs}}contact support{{/cs}}.', {
				args: {
					errorDescription: description.length ? description : defaultError
				},
				components: {
					br: <br />,
					cs: <a href="#" onClick={ this.contactSupport } />
				}
			}
		);
	},

	getErrorMessage: function() {
		let actionMessage;

		switch ( this.props.type ) {
			case 'uploadError':
				actionMessage = this.getUploadError();
				break;

			case 'importError':
				actionMessage = this.getImportError();
				break;
		}

		return actionMessage;
	},

	retryImport: function( event ) {
		event.preventDefault();
		event.stopPropagation();
	},

	render: function() {
		return (
			<div>
				<Notice
					status="is-error"
					text={ this.getErrorMessage() }
					showDismiss={ false }
				/>
			</div>
		);
	}
} );
