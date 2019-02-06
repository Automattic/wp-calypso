/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import {
	Button,
	ExternalLink,
	PanelBody,
	Placeholder,
	Spinner,
	TextControl,
	withNotices,
} from '@wordpress/components';
import { InspectorControls, RichText } from '@wordpress/editor';
import { Fragment, Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { icon } from '.';

const API_STATE_LOADING = 0;
const API_STATE_CONNECTED = 1;
const API_STATE_NOTCONNECTED = 2;

const NOTIFICATION_PROCESSING = 'processing';
const NOTIFICATION_SUCCESS = 'success';
const NOTIFICATION_ERROR = 'error';

class MailchimpSubscribeEdit extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			audition: null,
			connected: API_STATE_LOADING,
			connectURL: null,
		};
		this.timeout = null;
	}

	componentDidMount = () => {
		this.apiCall();
	};

	onError = ( code, message ) => {
		const { noticeOperations } = this.props;
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	};

	apiCall = () => {
		const path = '/wpcom/v2/mailchimp';
		const method = 'GET';
		const fetch = { path, method };
		apiFetch( fetch ).then(
			result => {
				const connectURL = result.connect_url;
				const connected =
					result.code === 'connected' ? API_STATE_CONNECTED : API_STATE_NOTCONNECTED;
				this.setState( { connected, connectURL } );
			},
			result => {
				const connectURL = null;
				const connected = API_STATE_NOTCONNECTED;
				this.setState( { connected, connectURL } );
				this.onError( null, result.message );
			}
		);
	};

	auditionNotification = notification => {
		this.setState( { audition: notification } );
		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}
		this.timeout = setTimeout( this.clearAudition, 3000 );
	};

	clearAudition = () => {
		this.setState( { audition: null } );
	};

	updateProcessingText = processingLabel => {
		const { setAttributes } = this.props;
		setAttributes( { processingLabel } );
		this.auditionNotification( NOTIFICATION_PROCESSING );
	};

	updateSuccessText = successLabel => {
		const { setAttributes } = this.props;
		setAttributes( { successLabel } );
		this.auditionNotification( NOTIFICATION_SUCCESS );
	};

	updateErrorText = errorLabel => {
		const { setAttributes } = this.props;
		setAttributes( { errorLabel } );
		this.auditionNotification( NOTIFICATION_ERROR );
	};

	updateEmailPlaceholder = emailPlaceholder => {
		const { setAttributes } = this.props;
		setAttributes( { emailPlaceholder } );
		this.clearAudition();
	};

	updateSubmitLabel = submitLabel => {
		const { setAttributes } = this.props;
		setAttributes( { submitLabel } );
		this.clearAudition();
	};

	render = () => {
		const { attributes, className, notices, noticeUI, setAttributes } = this.props;
		const { audition, connected, connectURL } = this.state;
		const {
			emailPlaceholder,
			title,
			submitLabel,
			consentText,
			processingLabel,
			successLabel,
			errorLabel,
		} = attributes;
		const classPrefix = 'wp-block-jetpack-mailchimp-';
		const waiting = (
			<Placeholder icon={ icon } notices={ notices }>
				<Spinner />
			</Placeholder>
		);
		const placeholder = (
			<Placeholder icon={ icon } label={ __( 'Mailchimp' ) } notices={ notices }>
				<div className="components-placeholder__instructions">
					{ __(
						'You need to connect your MailChimp account and choose a list in order to start collecting Email subscribers.'
					) }
					<br />
					<ExternalLink href={ connectURL }>{ __( 'Set up MailChimp form' ) }</ExternalLink>
					<br />
					<br />
					<Button isDefault onClick={ this.apiCall }>
						{ __( 'Re-check Connection' ) }
					</Button>
				</div>
			</Placeholder>
		);
		const inspectorControls = (
			<InspectorControls>
				<PanelBody title={ __( 'Text Elements' ) }>
					<TextControl
						label={ __( 'Email Placeholder' ) }
						value={ emailPlaceholder }
						onChange={ this.updateEmailPlaceholder }
					/>
					<TextControl
						label={ __( 'Submit button label' ) }
						value={ submitLabel }
						onChange={ this.updateSubmitLabel }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Notifications' ) }>
					<TextControl
						label={ __( 'Processing text' ) }
						value={ processingLabel }
						onChange={ this.updateProcessingText }
					/>
					<TextControl
						label={ __( 'Success text' ) }
						value={ successLabel }
						onChange={ this.updateSuccessText }
					/>
					<TextControl
						label={ __( 'Error text' ) }
						value={ errorLabel }
						onChange={ this.updateErrorText }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Mailchimp Connection' ) }>
					<ExternalLink href={ connectURL }>{ __( 'Manage Connection' ) }</ExternalLink>
				</PanelBody>
			</InspectorControls>
		);
		const blockContent = (
			<div className={ className }>
				<RichText
					tagName="h3"
					placeholder={ __( 'Write title' ) }
					value={ title }
					onChange={ value => setAttributes( { title: value } ) }
					inlineToolbar
				/>
				{ ! audition && (
					<form ref={ this.formRef }>
						<TextControl placeholder={ emailPlaceholder } />
						<Button isPrimary>{ submitLabel }</Button>
						<RichText
							tagName="figcaption"
							placeholder={ __( 'Write consent text' ) }
							value={ consentText }
							onChange={ value => setAttributes( { consentText: value } ) }
							inlineToolbar
						/>
					</form>
				) }
				{ audition === NOTIFICATION_PROCESSING && (
					<div
						className={ `${ classPrefix }notification ${ classPrefix }${ NOTIFICATION_PROCESSING }` }
					>
						{ processingLabel }
					</div>
				) }
				{ audition === NOTIFICATION_SUCCESS && (
					<div
						className={ `${ classPrefix }notification ${ classPrefix }${ NOTIFICATION_SUCCESS }` }
					>
						{ successLabel }
					</div>
				) }
				{ audition === NOTIFICATION_ERROR && (
					<div className={ `${ classPrefix }notification ${ classPrefix }${ NOTIFICATION_ERROR }` }>
						{ errorLabel }
					</div>
				) }
			</div>
		);
		return (
			<Fragment>
				{ noticeUI }
				{ connected === API_STATE_LOADING && waiting }
				{ connected === API_STATE_NOTCONNECTED && placeholder }
				{ connected === API_STATE_CONNECTED && inspectorControls }
				{ connected === API_STATE_CONNECTED && blockContent }
			</Fragment>
		);
	};
}

export default withNotices( MailchimpSubscribeEdit );
