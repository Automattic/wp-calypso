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
import GridiconMention from 'gridicons/dist/mention';

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
			'You’ll receive an email notification each time someone fills out the form. Where should it go, and what should the subject line be?'
		);
	}

	getEmailHelpMessage() {
		return __( 'You can enter multiple email addresses separated by commas.' );
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
							placeholder={ __( 'name@example.com' ) }
							value={ to }
							onChange={ this.onChangeTo }
							help={ this.getEmailHelpMessage() }
						/>
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
						<Placeholder label={ __( 'Contact Form' ) } icon={ <GridiconMention /> }>
							<form onSubmit={ this.onFormSettingsSet }>
								<p className="jetpack-contact-form__intro-message">{ this.getIntroMessage() }</p>
								<TextControl
									label={ __( 'Email address' ) }
									placeholder={ __( 'name@example.com' ) }
									value={ to }
									onChange={ this.onChangeTo }
									help={ this.getEmailHelpMessage() }
								/>
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
