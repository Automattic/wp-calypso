/**
 * External dependencies
 */
import classnames from 'classnames';
import { Button, PanelBody, Placeholder, TextControl, Path } from '@wordpress/components';
import { InnerBlocks, InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import { compose, withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { __ } from '../../../utils/i18n';
import renderMaterialIcon from '../../../utils/render-material-icon';
import SubmitButton from '../../../utils/submit-button';
import HelpMessage from '../../../shared/help-message';
const ALLOWED_BLOCKS = [
	'jetpack/markdown',
	'core/paragraph',
	'core/image',
	'core/heading',
	'core/gallery',
	'core/list',
	'core/quote',
	'core/shortcode',
	'core/audio',
	'core/code',
	'core/cover',
	'core/file',
	'core/html',
	'core/separator',
	'core/spacer',
	'core/subhead',
	'core/table',
	'core/verse',
	'core/video',
];

class JetpackContactForm extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeSubject = this.onChangeSubject.bind( this );
		this.onBlurTo = this.onBlurTo.bind( this );
		this.onChangeTo = this.onChangeTo.bind( this );
		this.onChangeSubmit = this.onChangeSubmit.bind( this );
		this.onFormSettingsSet = this.onFormSettingsSet.bind( this );
		this.getToValidationError = this.getToValidationError.bind( this );
		this.renderToAndSubjectFields = this.renderToAndSubjectFields.bind( this );
		this.preventEnterSubmittion = this.preventEnterSubmittion.bind( this );
		this.hasEmailError = this.hasEmailError.bind( this );

		const to = args[ 0 ].attributes.to ? args[ 0 ].attributes.to : '';
		const error = to
			.split( ',' )
			.map( this.getToValidationError )
			.filter( Boolean );

		this.state = {
			toError: error && error.length ? error : null,
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
		email = email.trim();
		if ( email.length === 0 ) {
			return false; // ignore the empty emails
		}
		if ( ! emailValidator.validate( email ) ) {
			return { email };
		}
		return false;
	}

	onBlurTo( event ) {
		const error = event.target.value
			.split( ',' )
			.map( this.getToValidationError )
			.filter( Boolean );
		if ( error && error.length ) {
			this.setState( { toError: error } );
			return;
		}
	}

	onChangeTo( to ) {
		const emails = to.trim();
		if ( emails.length === 0 ) {
			this.setState( { toError: null } );
			this.props.setAttributes( { to } );
			return;
		}

		this.setState( { toError: null } );
		this.props.setAttributes( { to } );
	}

	onChangeSubmit( submitButtonText ) {
		this.props.setAttributes( { submitButtonText } );
	}

	onFormSettingsSet( event ) {
		event.preventDefault();
		if ( this.state.toError ) {
			// don't submit the form if there are errors.
			return;
		}
		this.props.setAttributes( { hasFormSettingsSet: 'yes' } );
	}

	getfieldEmailError( errors ) {
		if ( errors ) {
			if ( errors.length === 1 ) {
				if ( errors[ 0 ] && errors[ 0 ].email ) {
					return sprintf( __( '%s is not a valid email address.' ), errors[ 0 ].email );
				}
				return errors[ 0 ];
			}

			if ( errors.length === 2 ) {
				return sprintf(
					__( '%s and %s are not a valid email address.' ),
					errors[ 0 ].email,
					errors[ 1 ].email
				);
			}
			const inValidEmails = errors.map( error => error.email );
			return sprintf( __( '%s are not a valid email address.' ), inValidEmails.join( ', ' ) );
		}
		return null;
	}

	preventEnterSubmittion( event ) {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	renderToAndSubjectFields() {
		const fieldEmailError = this.state.toError;
		const { instanceId, attributes } = this.props;
		const { subject, to } = attributes;
		return (
			<Fragment>
				<TextControl
					aria-describedby={ `contact-form-${ instanceId }-email-${
						this.hasEmailError() ? 'error' : 'help'
					}` }
					label={ __( 'Email address' ) }
					placeholder={ __( 'name@example.com' ) }
					onKeyDown={ this.preventEnterSubmittion }
					value={ to }
					onBlur={ this.onBlurTo }
					onChange={ this.onChangeTo }
				/>
				<HelpMessage isError id={ `contact-form-${ instanceId }-email-error` }>
					{ this.getfieldEmailError( fieldEmailError ) }
				</HelpMessage>
				<HelpMessage id={ `contact-form-${ instanceId }-email-help` }>
					{ this.getEmailHelpMessage() }
				</HelpMessage>

				<TextControl
					label={ __( 'Email subject line' ) }
					value={ subject }
					placeholder={ __( "Let's work together" ) }
					onChange={ this.onChangeSubject }
				/>
			</Fragment>
		);
	}

	hasEmailError() {
		const fieldEmailError = this.state.toError;
		return fieldEmailError && fieldEmailError.length > 0;
	}

	render() {
		const { className, attributes } = this.props;
		const { hasFormSettingsSet } = attributes;
		const formClassnames = classnames( className, 'jetpack-contact-form', {
			'has-intro': ! hasFormSettingsSet,
		} );

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Email feedback settings' ) }>
						{ this.renderToAndSubjectFields() }
					</PanelBody>
				</InspectorControls>
				<div className={ formClassnames }>
					{ ! hasFormSettingsSet && (
						<Placeholder
							label={ __( 'Form' ) }
							icon={ renderMaterialIcon(
								<Path d="M13 7.5h5v2h-5zm0 7h5v2h-5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11 6H6v5h5V6zm-1 4H7V7h3v3zm1 3H6v5h5v-5zm-1 4H7v-3h3v3z" />
							) }
						>
							<form onSubmit={ this.onFormSettingsSet }>
								<p className="jetpack-contact-form__intro-message">{ this.getIntroMessage() }</p>
								{ this.renderToAndSubjectFields() }
								<p className="jetpack-contact-form__intro-message">
									{ __(
										'(If you leave these blank, notifications will go to the author with the post or page title as the subject line.)'
									) }
								</p>
								<div className="jetpack-contact-form__create">
									<Button isPrimary type="submit" disabled={ this.hasEmailError() }>
										{ __( 'Add form' ) }
									</Button>
								</div>
							</form>
						</Placeholder>
					) }
					{ hasFormSettingsSet && (
						<InnerBlocks
							allowedBlocks={ ALLOWED_BLOCKS }
							templateLock={ false }
							template={ [
								[
									'jetpack/field-name',
									{
										required: true,
									},
								],
								[
									'jetpack/field-email',
									{
										required: true,
									},
								],
								[ 'jetpack/field-url', {} ],
								[ 'jetpack/field-textarea', {} ],
							] }
						/>
					) }
					{ hasFormSettingsSet && <SubmitButton { ...this.props } /> }
				</div>
			</Fragment>
		);
	}
}

export default compose( [ withInstanceId ] )( JetpackContactForm );
