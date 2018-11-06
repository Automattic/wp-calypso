/** @format */

/**
 * External dependencies
 */
import { PanelBody, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class JetpackForm extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeSubject = this.onChangeSubject.bind( this );
		this.onChangeTo = this.onChangeTo.bind( this );
		this.onChangeSubmit = this.onChangeSubmit.bind( this );
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

	render() {
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Submission Details', 'jetpack' ) }>
						<TextControl
							label={ __( 'What would you like the subject of the email to be?', 'jetpack' ) }
							value={ this.props.subject }
							onChange={ this.onChangeSubject }
						/>
						<TextControl
							label={ __( 'Which email address should we send the submissions to?', 'jetpack' ) }
							value={ this.props.to }
							onChange={ this.onChangeTo }
						/>
						<TextControl
							label={ __( 'What should the label on the form’s submit button say?', 'jetpack' ) }
							value={ this.props.submit_button_text }
							placeholder={ __( 'Submit', 'jetpack' ) }
							onChange={ this.onChangeSubmit }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ this.props.className + ' jetpack-form' }>
					{ this.props.children }
					<div className="button button-primary button-default jetpack-submit-button">
						{ this.props.submit_button_text ? this.props.submit_button_text : __( 'Submit', 'jetpack' ) }
					</div>
				</div>
			</Fragment>
		);
	}
}

export default JetpackForm;
