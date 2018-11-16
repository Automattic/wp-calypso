/** @format */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { Button, PanelBody, Placeholder, TextControl } from '@wordpress/components';
import { InnerBlocks, InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class JetpackContactForm extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeSubject = this.onChangeSubject.bind( this );
		this.onChangeTo = this.onChangeTo.bind( this );
		this.onChangeSubmit = this.onChangeSubmit.bind( this );
		this.onFormSettingsSet = this.onFormSettingsSet.bind( this );
	}

	getIntroMessage() {
		return __(
			'If left blank, feedback will be sent to the author of the post and the subject will be the name of this post.'
		);
	}

	getEmailHelpMessage() {
		return __(
			'You can enter multiple email addresses separated by commas. A notification email will be sent to each address.'
		);
	}

	onChangeSubject( subject ) {
		this.props.setAttributes( { subject } );
	}

	onChangeTo( to ) {
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
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Email feedback settings' ) }>
						<p>{ this.getIntroMessage() }</p>
						<TextControl
							label={ __( 'Email address' ) }
							value={ to }
							onChange={ this.onChangeTo }
							help={ this.getEmailHelpMessage() }
						/>
						<TextControl
							label={ __( 'Email subject line' ) }
							value={ subject }
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
						<Placeholder label={ __( 'Contact Form' ) } icon="feedback">
							<form onSubmit={ this.onFormSettingsSet }>
								<p className="jetpack-contact-form__intro-message">{ this.getIntroMessage() }</p>
								<TextControl
									label={ __( 'Email address' ) }
									placeholder={ __( 'Example: name@example.com' ) }
									value={ to }
									onChange={ this.onChangeTo }
									help={ this.getEmailHelpMessage() }
								/>
								<TextControl
									label={ __( 'Email subject line' ) }
									value={ subject }
									placeholder={ __( "Example: Let's work together" ) }
									onChange={ this.onChangeSubject }
								/>
								<div className="jetpack-contact-form__create">
									<Button isPrimary type="submit">
										{ __( 'Create' ) }
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
