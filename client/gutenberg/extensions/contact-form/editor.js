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

class GrunionForm extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeSubject = this.onChangeSubject.bind( this );
		this.onChangeTo = this.onChangeTo.bind( this );
		this.onChangeSubmit = this.onChangeSubmit.bind( this );
	}

	onChangeSubject( x ) {
		this.props.setAttributes( { subject: x } );
	}

	onChangeTo( x ) {
		this.props.setAttributes( { to: x } );
	}

	onChangeSubmit( x ) {
		this.props.setAttributes( { submit_button_text: x } );
	}

	render() {
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Submission Details', 'jetpack' ) }>
						<TextControl
							label={ __( 'What would you like the subject of the email to be?' ) }
							value={ this.props.subject }
							onChange={ this.onChangeSubject }
						/>
						<TextControl
							label={ __( 'Which email address should we send the submissions to?' ) }
							value={ this.props.to }
							onChange={ this.onChangeTo }
						/>
						<TextControl
							label={ __( 'What should the label on the form’s submit button say?' ) }
							value={ this.props.submit_button_text }
							placeholder={ __( 'Submit »' ) }
							onChange={ this.onChangeSubmit }
						/>
					</PanelBody>
				</InspectorControls>
				<div className="grunion-form">
					{this.props.children}
					<TextControl
						className="button button-primary button-default grunion-submit-button"
						value={ this.props.submit_button_text }
						placeholder={ __( 'Submit »' ) }
						onChange={ this.onChangeSubmit }
					/>
				</div>
			</Fragment>
		);
	}
}

function GrunionFieldRequiredToggle( props ) {
	return (
		<ToggleControl
			label={ __( 'Required' ) }
			checked={ props.required }
			onChange={ props.onChange }
		/>
	);
}

class GrunionFieldSettings extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeRequired = this.onChangeRequired.bind( this );
	}

	onChangeRequired( x ) {
		this.props.setAttributes( { required: x } );
	}

	render() {
		return (
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'jetpack' ) }>
					<GrunionFieldRequiredToggle
						required={ this.props.required }
						onChange={ this.onChangeRequired }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}
}

class GrunionFieldLabel extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeLabel = this.onChangeLabel.bind( this );
	}

	onChangeLabel( x ) {
		this.props.setAttributes( { label: x.target.value } );
	}

	render() {
		return (
			<Fragment>
				<input
					type='text'
					value={ this.props.label }
					className='grunion-field-label'
					onChange={ this.onChangeLabel }
				/>
				{ this.props.required && <span className="required">{ __( '(required)' ) }</span> }
			</Fragment>
		);
	}
}

function GrunionField( props ) {
	return (
		<Fragment>
			<GrunionFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="grunion-field">
				<TextControl
					type={ props.type }
					label={ <GrunionFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled={ true }
				/>
			</div>
		</Fragment>
	);
}

function GrunionFieldTextarea( props ) {
	return (
		<Fragment>
			<GrunionFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="grunion-field">
				<TextareaControl
					label={ <GrunionFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled={ true }
				/>
			</div>
		</Fragment>
	);
}

function GrunionFieldCheckbox( props ) {
	return (
		<Fragment>
			<GrunionFieldSettings
				required={ props.required }
				setAttributes={ props.setAttributes }
			/>
			<div className="grunion-field">
				<CheckboxControl
					label={ <GrunionFieldLabel
						required={ props.required }
						label={ props.label }
						setAttributes={ props.setAttributes }
					/> }
					disabled={ true }
				/>
			</div>
		</Fragment>
	);
}

class GrunionFieldMultiple extends Component {
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
				<GrunionFieldSettings
					required={ this.props.required }
					setAttributes={ this.props.setAttributes }
				/>
				<div className="grunion-field">
					<GrunionFieldLabel
						required={ this.props.required }
						label={ this.props.label }
						setAttributes={ this.props.setAttributes }
					/>
					<ol>
						{ this.props.options.map( ( option, index )=>(
							<GrunionOption
								key={ index }
								option={ option }
								index={ index }
								onChangeOption={ this.onChangeOption }
							/>
						) ) }
					</ol>
					<IconButton
						icon="insert"
						label={ __( 'Insert option' ) }
						onClick={ this.onChangeOption }
					> { __( 'Add' ) }</IconButton>
				</div>
			</Fragment>
		)
	}
}

class GrunionOption extends Component {
	constructor( ...args ) {
		super( ...args );
		this.onChangeOption = this.onChangeOption.bind( this );
		this.onDeleteOption = this.onDeleteOption.bind( this );
	}

	onChangeOption( x ) {
		this.props.onChangeOption( this.props.index, x.target.value );
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
					placeholder={ __( 'Enter your option value here…' ) }
					onChange={ this.onChangeOption }
				/>
				<IconButton
					icon="no"
					label={ __( 'Remove option' ) }
					onClick={ this.onDeleteOption }
				/>
			</li>
		);
	}
}

/**
 * Block Registrations:
 */

registerBlockType( 'grunion/form', {
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
			'default': __( 'Submit »' )
		}
	},

	edit: function( props ) {
		return (
			<GrunionForm
				key="grunion/form"
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
						[ 'grunion/field-name', { label: __( 'Name' ) } ],
						[ 'grunion/field-email', { label: __( 'Email' ) } ],
						[ 'grunion/field-text', { label: __( 'Subject' ) } ],
						[ 'grunion/field-textarea', { label: __( 'Message' ) } ]
					] }
				/>
			</GrunionForm>
		);
	},

	save: function() {
		return (
			<InnerBlocks.Content />
		);
	}
} );

const FieldDefaults = {
	icon: 'feedback',
	category: 'common',
	parent: [ 'grunion/form' ],
	supports: {
		html: false
	},
	attributes: {
		label: {
			type: 'string',
			'default': __( 'Type here...' )
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
				blocks: [ 'grunion/field-text' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-text', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-name' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-name', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-email' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-email', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-url' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-url', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-date' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-date', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-telephone' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-telephone', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-textarea' ],
				isMatch: ( { options } ) => ! options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-textarea', attributes )
			},
			/* // not yet ready for prime time.
			{
				type: 'block',
				blocks: [ 'grunion/field-checkbox' ],
				isMatch: ( { options } ) => 1 === options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-checkbox', attributes )
			},
			*/
			{
				type: 'block',
				blocks: [ 'grunion/field-checkbox-multiple' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-checkbox-multiple', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-radio' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-radio', attributes )
			},
			{
				type: 'block',
				blocks: [ 'grunion/field-select' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: ( attributes )=>createBlock( 'grunion/field-select', attributes )
			}
		]
	},
	save : function() {
		return null;
	}
};

registerBlockType( 'grunion/field-text', Object.assign( {
	title       : __( 'Text', 'jetpack' ),
	edit: function( props ) {
		return ( <GrunionField
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-name', Object.assign( {
	title       : __( 'Name', 'jetpack' ),
	icon        : 'admin-users',
	edit: function( props ) {
		return ( <GrunionField
			type="text"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-email', Object.assign( {
	title       : __( 'Email', 'jetpack' ),
	icon        : 'email',
	edit: function( props ) {
		return ( <GrunionField
			type="email"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-url', Object.assign( {
	title       : __( 'URL', 'jetpack' ),
	icon        : 'share-alt2',
	edit: function( props ) {
		return ( <GrunionField
			type="url"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-date', Object.assign( {
	title       : __( 'Date', 'jetpack' ),
	icon        : 'calendar-alt',
	edit: function( props ) {
		return ( <GrunionField
			type="text"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-telephone', Object.assign( {
	title       : __( 'Telephone', 'jetpack' ),
	icon        : 'phone',
	edit: function( props ) {
		return ( <GrunionField
			type="tel"
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-textarea', Object.assign( {
	title       : __( 'Textarea', 'jetpack' ),
	edit: function( props ) {
		return ( <GrunionFieldTextarea
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-checkbox', Object.assign( {
	title       : __( 'Checkbox', 'jetpack' ),
	icon        : 'forms',
	edit: function( props ) {
		return ( <GrunionFieldCheckbox
			label={ props.attributes.label }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-checkbox-multiple', Object.assign( {
	title       : __( 'Checkbox Multiple', 'jetpack' ),
	icon        : 'forms',
	edit: function( props ) {
		return (<GrunionFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/>);
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-radio', Object.assign( {
	title       : __( 'Radio', 'jetpack' ),
	edit: function( props ) {
		return (<GrunionFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/>);
	}
}, FieldDefaults ) );

registerBlockType( 'grunion/field-select', Object.assign( {
	title       : __( 'Select', 'jetpack' ),
	edit: function( props ) {
		return (<GrunionFieldMultiple
			required={ props.attributes.required }
			label={ props.attributes.label }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/>);
	}
}, FieldDefaults ) );

