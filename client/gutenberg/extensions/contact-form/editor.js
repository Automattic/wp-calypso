/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import {
	PanelBody,
	TextControl,
	TextareaControl,
	CheckboxControl,
	ToggleControl,
	IconButton
} from '@wordpress/components';

import {
	registerBlockType,
	createBlock
} from '@wordpress/blocks';

import {
	InnerBlocks,
	InspectorControls
} from '@wordpress/editor';

import {
	Component,
	Fragment
} from '@wordpress/element';

import {
	__
} from '@wordpress/i18n';

/**
 * Components:
 */

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
							placeholder={ __( 'Submit »', 'jetpack' ) }
							onChange={ this.onChangeSubmit }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ this.props.className + ' jetpack-form' }>
					{ this.props.children }
					<TextControl
						className="button button-primary button-default jetpack-submit-button"
						value={ this.props.submit_button_text }
						placeholder={ __( 'Submit »', 'jetpack' ) }
						onChange={ this.onChangeSubmit }
					/>
				</div>
			</Fragment>
		);
	}
}

function JetpackFieldRequiredToggle( props ) {
	return (
		<ToggleControl
			label={ __( 'Required', 'jetpack' ) }
			checked={ props.required }
			onChange={ props.onChange }
		/>
	);
}

class JetpackFieldSettings extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeRequired = this.onChangeRequired.bind( this );
	}

	onChangeRequired( required ) {
		this.props.setAttributes( { required } );
	}

	render() {
		return (
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'jetpack' ) }>
					<JetpackFieldRequiredToggle
						required={ this.props.required }
						onChange={ this.onChangeRequired }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}
}

class JetpackFieldLabel extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeLabel = this.onChangeLabel.bind( this );
	}

	onChangeLabel( event ) {
		this.props.setAttributes( { label: event.target.value } );
	}

	render() {
		return (
			<Fragment>
				<input
					type="text"
					value={ this.props.label }
					className="jetpack-field-label"
					onChange={ this.onChangeLabel }
				/>
				{ this.props.required && <span className="required">{ __( '(required)', 'jetpack' ) }</span> }
			</Fragment>
		);
	}
}

function JetpackField( props ) {
	return (
		<Fragment>
			<JetpackFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="jetpack-field">
				<TextControl
					type={ props.type }
					label={ <JetpackFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled
				/>
			</div>
		</Fragment>
	);
}

function JetpackFieldTextarea( props ) {
	return (
		<Fragment>
			<JetpackFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="jetpack-field">
				<TextareaControl
					label={ <JetpackFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled
				/>
			</div>
		</Fragment>
	);
}

function JetpackFieldCheckbox( props ) {
	return (
		<Fragment>
			<JetpackFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="jetpack-field">
				<CheckboxControl
					label={ <JetpackFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled
				/>
			</div>
		</Fragment>
	);
}

class JetpackFieldMultiple extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
	}

	onChangeOption( key = null, option = null ) {
		const newOptions = this.props.options.slice( 0 );
		if ( 'object' === typeof key ) {
			newOptions.push( '' );
		} else if ( null === option ) {
			newOptions.splice( key, 1 );
		} else {
			newOptions.splice( key, 1, option );
		}
		this.props.setAttributes( { options: newOptions } );
	}

	render() {
		return (
			<Fragment>
				<JetpackFieldSettings
					required={ this.props.required }
					setAttributes={ this.props.setAttributes }
				/>
				<div className="jetpack-field">
					<JetpackFieldLabel
						required={ this.props.required }
						label={ this.props.label }
						setAttributes={ this.props.setAttributes }
					/>
					<ol>
						{ this.props.options.map( ( option, index )=>(
							<JetpackOption
								key={ index }
								option={ option }
								index={ index }
								onChangeOption={ this.onChangeOption }
							/>
						) ) }
					</ol>
					<IconButton
						icon="insert"
						label={ __( 'Insert option', 'jetpack' ) }
						onClick={ this.onChangeOption }
					> { __( 'Add', 'jetpack' ) }</IconButton>
				</div>
			</Fragment>
		)
	}
}

class JetpackOption extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
		this.onDeleteOption = this.onDeleteOption.bind( this );
	}

	onChangeOption( event ) {
		this.props.onChangeOption( this.props.index, event.target.value );
	}

	onDeleteOption() {
		this.props.onChangeOption( this.props.index );
	}

	render() {
		return (
			<li>
				<input
					type="text"
					className="option"
					value={ this.props.option }
					placeholder={ __( 'Enter your option value here…', 'jetpack' ) }
					onChange={ this.onChangeOption }
				/>
				<IconButton
					icon="no"
					label={ __( 'Remove option', 'jetpack' ) }
					onClick={ this.onDeleteOption }
				/>
			</li>
		);
	}
}

/**
 * Block Registrations:
 */

registerBlockType( 'jetpack/form', {
	title: __( 'Contact Form', 'jetpack' ),
	icon: 'feedback',
	category: 'widgets',
	supports: {
		html: false
	},
	/* // not yet ready for prime time.
	transforms: {
		from: [
			{
				type: 'shortcode',
				tag: 'contact-form',
				attributes: {
					subject: {
						type: 'string',
						shortcode: function( named ) {
							return named.subject;
						},
					},
					to: {
						type: 'string',
						shortcode: function( named ) {
							return named.to;
						},
					},
					submit_button_text: {
						type: 'string',
						shortcode: function( named ) {
							return named.submit_button_text;
						},
					},
				}

			}
		]
	},
	*/

	attributes: {
		subject: {
			type: 'string',
			'default': null
		},
		to: {
			type: 'string',
			'default': null
		},
		submit_button_text: {
			type: 'string',
			'default': __( 'Submit »', 'jetpack' )
		}
	},

	edit: function( props ) {
		return (
			<JetpackForm
				key="jetpack/form"
				className={ props.className }
				subject={ props.attributes.subject }
				to={ props.attributes.to }
				submit_button_text={ props.attributes.submit_button_text }
				setAttributes={ props.setAttributes }
			>
				<InnerBlocks
					allowedBlocks={ [] }
					templateLock={false}
					template={ [
						[ 'jetpack/field-name', { label: __( 'Name', 'jetpack' ) } ],
						[ 'jetpack/field-email', { label: __( 'Email', 'jetpack' ) } ],
						[ 'jetpack/field-text', { label: __( 'Subject', 'jetpack' ) } ],
						[ 'jetpack/field-textarea', { label: __( 'Message', 'jetpack' ) } ]
					] }
				/>
			</JetpackForm>
		);
	},

	save: function() {
		return (
			<InnerBlocks.Content />
		);
	}
} );

const FieldDefaults = {
	category: 'common',
	parent: [ 'jetpack/form' ],
	supports: {
		html: false
	},
	attributes: {
		label: {
			type: 'string',
			'default': __( 'Type here...', 'jetpack' )
		},
		required: {
			type: 'boolean',
			'default': false
		},
		options: {
			type: 'array',
			'default': []
		}
	},
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'jetpack/field-text' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-text', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-name' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-name', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-email' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-email', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-url' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-url', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-date' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-date', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-telephone' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-telephone', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-textarea' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-textarea', attributes )
			},
			/* // not yet ready for prime time.
			{
				type: 'block',
				blocks: [ 'jetpack/field-checkbox' ],
				isMatch: ( { options } ) => 1 === options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-checkbox', attributes )
			},
			*/
			{
				type: 'block',
				blocks: [ 'jetpack/field-checkbox-multiple' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-checkbox-multiple', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-radio' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-radio', attributes )
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-select' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'jetpack/field-select', attributes )
			}
		]
	},
	save : function() {
		return null;
	}
};

registerBlockType( 'jetpack/field-text', Object.assign( {
	title: __( 'Text', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackField
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-name', Object.assign( {
	title: __( 'Name', 'jetpack' ),
	icon: 'admin-users',
	edit: function( props ) {
		return ( <JetpackField
			type="text"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-email', Object.assign( {
	title: __( 'Email', 'jetpack' ),
	icon: 'email',
	edit: function( props ) {
		return ( <JetpackField
			type="email"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-url', Object.assign( {
	title: __( 'URL', 'jetpack' ),
	icon: 'share-alt2',
	edit: function( props ) {
		return ( <JetpackField
			type="url"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-date', Object.assign( {
	title: __( 'Date', 'jetpack' ),
	icon: 'calendar-alt',
	edit: function( props ) {
		return ( <JetpackField
			type="text"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-telephone', Object.assign( {
	title: __( 'Telephone', 'jetpack' ),
	icon: 'phone',
	edit: function( props ) {
		return ( <JetpackField
			type="tel"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-textarea', Object.assign( {
	title: __( 'Textarea', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackFieldTextarea
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-checkbox', Object.assign( {
	title: __( 'Checkbox', 'jetpack' ),
	icon: 'forms',
	edit: function( props ) {
		return ( <JetpackFieldCheckbox
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-checkbox-multiple', Object.assign( {
	title: __( 'Checkbox Multiple', 'jetpack' ),
	icon: 'forms',
	edit: function( props ) {
		return ( <JetpackFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-radio', Object.assign( {
	title: __( 'Radio', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-select', Object.assign( {
	title: __( 'Select', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

