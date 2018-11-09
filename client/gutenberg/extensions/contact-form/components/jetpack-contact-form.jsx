/** @format */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { PanelBody, TextControl, Button, Placeholder } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
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
		const formClassnames = classnames( this.props.className, 'jetpack-contact-form', {
			'has-intro': ! this.props.has_form_settings_set,
		} );
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Submission Details' ) }>
						<TextControl
							label={ __( 'Which email address should we send the submissions to?' ) }
							value={ this.props.to }
							onChange={ this.onChangeTo }
						/>
						<TextControl
							label={ __( 'What would you like the subject of the email to be?' ) }
							value={ this.props.subject }
							onChange={ this.onChangeSubject }
						/>
						<TextControl
							label={ __( 'What should the label on the form’s submit button say?' ) }
							value={ this.props.submit_button_text }
							placeholder={ __( 'Submit', 'jetpack' ) }
							onChange={ this.onChangeSubmit }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ formClassnames }>
					{ ! this.props.has_form_settings_set && (
						<Placeholder label={ __( 'Contact Form' ) } icon="feedback">
							<form onSubmit={ this.onFormSettingsSet }>
								<p className="jetpack-contact-form__intro-message">
									{ __(
										'If left black, feedback will be sent to the author of the post and the subject will be the name of this post.'
									) }
								</p>
								<TextControl
									label={ __( 'Email address' ) }
									placeholder={ __( 'Example: muriel@design.blog' ) }
									value={ this.props.to }
									onChange={ this.onChangeTo }
									help={ __(
										'You can enter multiple email addresses separated by commas. A notification email will be sent to each address.'
									) }
								/>
								<TextControl
									label={ __( 'Email subject line' ) }
									value={ this.props.subject }
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
					{ this.props.has_form_settings_set && this.props.children }
					{ this.props.has_form_settings_set && (
						<div className="button button-primary button-default jetpack-submit-button">
							{ this.props.submit_button_text ? this.props.submit_button_text : __( 'Submit' ) }
						</div>
					) }
				</div>
			</Fragment>
		);
	}
}

export default JetpackContactForm;
