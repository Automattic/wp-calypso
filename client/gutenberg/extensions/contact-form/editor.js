/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import {
	registerBlockType,
	getBlockType,
	createBlock
} from '@wordpress/blocks';

import {
	InnerBlocks
} from '@wordpress/editor';

import {
	__
} from '@wordpress/i18n';

/**
 * Internal dependencies
 */

import './editor.scss';
import JetpackForm from './components/JetpackForm';
import JetpackField from './components/JetpackField';
import JetpackFieldTextarea from './components/JetpackFieldTextarea';
import JetpackFieldCheckbox from './components/JetpackFieldCheckbox';
import JetpackFieldMultiple from './components/JetpackFieldMultiple';

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
			'default': __( 'Submit', 'jetpack' )
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
				//	allowedBlocks={ [] }
					templateLock={false}
					template={ [
						[ 'jetpack/field-name', {
							label: __( 'Name', 'jetpack' ),
							required: true
						} ],
						[ 'jetpack/field-email', {
							label: __( 'Email', 'jetpack' ),
							required: true
						} ],
						[ 'jetpack/field-text', {
							label: __( 'Subject', 'jetpack' )
						} ],
						[ 'jetpack/field-textarea', {
							label: __( 'Message', 'jetpack' )
						} ]
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
			'default': null
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

const getFieldLabel = function( props ) {
	if ( null === props.attributes.label ) {
		return getBlockType( props.name ).title;
	}
	return props.attributes.label;
};

registerBlockType( 'jetpack/field-text', Object.assign( {
	title: __( 'Text', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackField
			type="text"
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
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
			label={ getFieldLabel( props ) }
			required={ props.attributes.required }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
			type="checkbox"
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-radio', Object.assign( {
	title: __( 'Radio', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackFieldMultiple
			label={ getFieldLabel( props ) }
			required={ props.attributes.required }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
			type="radio"
		/> );
	}
}, FieldDefaults ) );

registerBlockType( 'jetpack/field-select', Object.assign( {
	title: __( 'Select', 'jetpack' ),
	icon: 'feedback',
	edit: function( props ) {
		return ( <JetpackFieldMultiple
			label={ getFieldLabel( props ) }
			required={ props.attributes.required }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
		/> );
	}
}, FieldDefaults ) );
