/** @format */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { Button, PanelBody, Placeholder, TextControl } from '@wordpress/components';
import { InnerBlocks, InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import emailValidator from 'email-validator';
/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';

class JetpackContactForm extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeSubject = this.onChangeSubject.bind( this );
		this.onChangeTo = this.onChangeTo.bind( this );
		this.onChangeSubmit = this.onChangeSubmit.bind( this );
		this.onFormSettingsSet = this.onFormSettingsSet.bind( this );
		this.getToValidationError = this.getToValidationError.bind( this );
		this.state = {
			toError: null,
		};
	}

	getIntroMessage() {
		return __(
			'You’ll receive an email notification each time someone fills out the form. Where should it go, and what should the subject line be?'
		);
	}

	getEmailHelpMessage() {
		return __( 'You can enter multiple email addresses separated by commas.' );
	}

	onChangeSubject( subject ) {
		this.props.setAttributes( { subject } );
	}

	getToValidationError( email ) {
		if ( ! email ) {
			return __( 'Email is empty' );
		}

		if ( ! emailValidator.validate( email ) ) {
			return sprintf( __( '%s is not a valid email address.' ), email );
		}
		return false;
	}

	onChangeTo( to ) {
		error = this.getToValidationError( to );
		if ( error ) {
			this.setState( { toError: error } );
		}
		this.setState( { toError: null } );
		this.props.setAttributes( { to } );
	}

	onChangeSubmit( submit_button_text ) {
		this.props.setAttributes( { submit_button_text } );
	}

	onFormSettingsSet( event ) {
		event.preventDefault();
		this.props.setAttributes( { has_form_settings_set: 'yes' } );
	}

	render() {
		const { className, attributes } = this.props;
		const { has_form_settings_set, subject, submit_button_text, to } = attributes;
		const formClassnames = classnames( className, 'jetpack-contact-form', {
			'has-intro': ! has_form_settings_set,
		} );

		const fieldEmailError = this.stats.toError;
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Email feedback settings' ) }>
						<p>{ this.getIntroMessage() }</p>
						<TextControl
							label={ __( 'Email address' ) }
							placeholder={ __( 'name@example.com' ) }
<<<<<<< HEAD
=======
							aria-describedby={ `${ instanceId }-email-${ fieldEmailError ? 'error' : 'help' }` }
>>>>>>> e9bdc756bf... Contact Form Block: Update/contact form block text changes (#28616)
							value={ to }
							onChange={ this.onChangeTo }
						/>
						<HelpMessage id={ `${ instanceId }-email-error` } isError>
							{ fieldEmailError }
						</HelpMessage>
						<HelpMessage id={ `${ instanceId }-email-info` }>
							{ this.getEmailHelpMessage() }
						</HelpMessage>
						<TextControl
							label={ __( 'Email subject line' ) }
							value={ subject }
							placeholder={ __( "Let's work together" ) }
							onChange={ this.onChangeSubject }
						/>
					</PanelBody>
				</InspectorControls>
				<InspectorControls>
					<PanelBody title={ __( 'Button settings' ) }>
						<TextControl
							label={ __( 'Submit button label' ) }
							value={ submit_button_text }
							placeholder={ __( 'Submit' ) }
							onChange={ this.onChangeSubmit }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ formClassnames }>
					{ ! has_form_settings_set && (
						<Placeholder
							label={ __( 'Contact Form' ) }
							icon={ renderMaterialIcon(
								<path d="M13 7.5h5v2h-5zm0 7h5v2h-5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11 6H6v5h5V6zm-1 4H7V7h3v3zm1 3H6v5h5v-5zm-1 4H7v-3h3v3z" />
							) }
						>
							<form onSubmit={ this.onFormSettingsSet }>
								<p className="jetpack-contact-form__intro-message">{ this.getIntroMessage() }</p>
								<TextControl
									aria-describedby={ `${ instanceId }-email-${
										fieldEmailError ? 'error' : 'help'
									}` }
									label={ __( 'Email address' ) }
									placeholder={ __( 'name@example.com' ) }
									value={ to }
									onChange={ this.onChangeTo }
								/>
								<HelpMessage id={ `${ instanceId }-email-error` } isError>
									{ fieldEmailError }
								</HelpMessage>
								<HelpMessage id={ `${ instanceId }-email-info` }>
									{ this.getEmailHelpMessage() }
								</HelpMessage>
								<TextControl
									label={ __( 'Email subject line' ) }
									value={ subject }
									placeholder={ __( "Let's work together" ) }
									onChange={ this.onChangeSubject }
								/>
								<p className="jetpack-contact-form__intro-message">
									{ __(
										'(If you leave these blank, notifications will go to the author with the post or page title as the subject line.)'
									) }
								</p>
								<div className="jetpack-contact-form__create">
									<Button isPrimary type="submit">
										{ __( 'Add Form' ) }
									</Button>
								</div>
							</form>
						</Placeholder>
					) }
					{ has_form_settings_set && (
						<InnerBlocks
							templateLock={ false }
							template={ [
								[
									'jetpack/field-name',
									{
										label: __( 'Name' ),
										required: true,
									},
								],
								[
									'jetpack/field-email',
									{
										label: __( 'Email' ),
										required: true,
									},
								],
								[
									'jetpack/field-url',
									{
										label: __( 'Website' ),
									},
								],
								[
									'jetpack/field-textarea',
									{
										label: __( 'Message' ),
									},
								],
							] }
						/>
					) }
					{ has_form_settings_set && (
						<div className="button button-primary button-default jetpack-submit-button">
							{ submit_button_text ? submit_button_text : __( 'Submit' ) }
						</div>
					) }
				</div>
			</Fragment>
		);
	}
}

export default JetpackContactForm;
