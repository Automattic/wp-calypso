/** @format */

/**
 * External dependencies
 */
import { registerBlockType, getBlockType, createBlock } from '@wordpress/blocks';
import { Fragment } from '@wordpress/element';
import { SVG, Path } from '@wordpress/components';
import { InnerBlocks } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';
import JetpackForm from './components/jetpack-form';
import JetpackField from './components/jetpack-field';
import JetpackFieldTextarea from './components/jetpack-field-textarea';
import JetpackFieldCheckbox from './components/jetpack-field-checkbox';
import JetpackFieldMultiple from './components/jetpack-field-multiple';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Block Registrations:
 */
registerBlockType( 'jetpack/form', {
	title: __( 'Contact Form', 'jetpack' ),
	description: __( 'A simple way to get feedback from folks visiting your site.' ),
	icon: 'feedback',
	category: 'jetpack',
	supports: {
		html: false,
	},
	attributes: {
		subject: {
			type: 'string',
			default: null,
		},
		to: {
			type: 'string',
			default: null,
		},
		submit_button_text: {
			type: 'string',
			default: __( 'Submit' ),
		},
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
				isSelected={ props.isSelected }
			>
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
			</JetpackForm>
		);
	},

	save: function() {
		return <InnerBlocks.Content />;
	},
} );

const FieldDefaults = {
	category: 'jetpack',
	parent: [ 'jetpack/form' ],
	supports: {
		html: false,
	},
	attributes: {
		label: {
			type: 'string',
			default: null,
		},
		required: {
			type: 'boolean',
			default: false,
		},
		options: {
			type: 'array',
			default: [],
		},
	},
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'jetpack/field-text' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-text', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-name' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-name', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-email' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-email', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-url' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-url', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-date' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-date', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-telephone' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-telephone', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-textarea' ],
				isMatch: ( { options } ) => ! options.length,
				transform: attributes => createBlock( 'jetpack/field-textarea', attributes ),
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
				transform: attributes => createBlock( 'jetpack/field-checkbox-multiple', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-radio' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: attributes => createBlock( 'jetpack/field-radio', attributes ),
			},
			{
				type: 'block',
				blocks: [ 'jetpack/field-select' ],
				isMatch: ( { options } ) => 1 <= options.length,
				transform: attributes => createBlock( 'jetpack/field-select', attributes ),
			},
		],
	},
	save: function() {
		return null;
	},
};

const getFieldLabel = function( props ) {
	if ( null === props.attributes.label ) {
		return getBlockType( props.name ).title;
	}
	return props.attributes.label;
};

const renderSVG = svg => (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path fill="none" d="M0 0h24v24H0V0z" />
		{ svg }
	</SVG>
);

const editField = type => props => {
	return (
		<JetpackField
			type={ type }
			label={ getFieldLabel( props ) }
			required={ props.attributes.required }
			setAttributes={ props.setAttributes }
			isSelected={ props.isSelected }
		/>
	);
};

const editMultiField = type => props => {
	return (
		<JetpackFieldMultiple
			label={ getFieldLabel( props ) }
			required={ props.attributes.required }
			options={ props.attributes.options }
			setAttributes={ props.setAttributes }
			type={ type }
			isSelected={ props.isSelected }
		/>
	);
};

registerBlockType(
	'jetpack/field-text',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Text' ),
		description: __( 'When you need just a small amount of text, add a text input.' ),
		icon: renderSVG( <Path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" /> ),
		edit: editField( 'text' ),
	} )
);

registerBlockType(
	'jetpack/field-name',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Name' ),
		description: __( 'Introductions are important. Add an input for folks to add their name.' ),
		icon: renderSVG(
			<Path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
		),
		edit: editField( 'text' ),
	} )
);

registerBlockType(
	'jetpack/field-email',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Email' ),
		description: __( 'Want to reply to folks? Add an email address input.' ),
		icon: renderSVG(
			<Path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
		),
		edit: editField( 'email' ),
	} )
);

registerBlockType(
	'jetpack/field-url',
	Object.assign( {}, FieldDefaults, {
		title: __( 'URL' ),
		description: __( 'Add an address input for a website.' ),
		icon: renderSVG(
			<Path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
		),
		edit: editField( 'url' ),
	} )
);

registerBlockType(
	'jetpack/field-date',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Date' ),
		description: __( 'The best way to set a date. Add a date picker.' ),
		icon: renderSVG(
			<Path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z" />
		),
		edit: editField( 'text' ),
	} )
);

registerBlockType(
	'jetpack/field-telephone',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Telephone' ),
		description: __( 'Add a phone number input.' ),
		icon: renderSVG(
			<Path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z" />
		),
		edit: editField( 'tel' ),
	} )
);

registerBlockType(
	'jetpack/field-textarea',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Textarea' ),
		description: __( 'Let folks speak their mind. A textarea is great for longer responses.' ),
		icon: renderSVG( <Path d="M21 11.01L3 11v2h18zM3 16h12v2H3zM21 6H3v2.01L21 8z" /> ),
		edit: function( props ) {
			return (
				<JetpackFieldTextarea
					label={ getFieldLabel( props ) }
					required={ props.attributes.required }
					setAttributes={ props.setAttributes }
					isSelected={ props.isSelected }
				/>
			);
		},
	} )
);

registerBlockType(
	'jetpack/field-checkbox',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Checkbox' ),
		description: __( 'Add a single checkbox.' ),
		icon: renderSVG(
			<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z" />
		),
		edit: function( props ) {
			return (
				<JetpackFieldCheckbox
					label={ getFieldLabel( props ) }
					required={ props.attributes.required }
					setAttributes={ props.setAttributes }
					isSelected={ props.isSelected }
				/>
			);
		},
	} )
);

registerBlockType(
	'jetpack/field-checkbox-multiple',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Checkbox group' ),
		description: __( 'People love options. Add several checkbox items.' ),
		icon: renderSVG(
			<Path d="M13 7.5h5v2h-5zm0 7h5v2h-5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11 6H6v5h5V6zm-1 4H7V7h3v3zm1 3H6v5h5v-5zm-1 4H7v-3h3v3z" />
		),
		edit: editMultiField( 'checkbox' ),
		attributes: {
			...FieldDefaults.attributes,
			label: {
				type: 'string',
				default: 'Choose several',
			},
		},
	} )
);

registerBlockType(
	'jetpack/field-radio',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Radio' ),
		description: __(
			'Inpsired by radios, only one radio item can be selected at a time. Add several radio button items.'
		),
		icon: renderSVG(
			<Fragment>
				<Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
				<circle cx="12" cy="12" r="5" />
			</Fragment>
		),
		edit: editMultiField( 'radio' ),
		attributes: {
			...FieldDefaults.attributes,
			label: {
				type: 'string',
				default: 'Choose one',
			},
		},
	} )
);

registerBlockType(
	'jetpack/field-select',
	Object.assign( {}, FieldDefaults, {
		title: __( 'Select' ),
		description: __( 'Compact, but powerful. Add a select box with several items.' ),
		icon: renderSVG( <Path d="M3 17h18v2H3zm16-5v1H5v-1h14m2-2H3v5h18v-5zM3 6h18v2H3z" /> ),
		edit: editMultiField( 'select' ),
		attributes: {
			...FieldDefaults.attributes,
			label: {
				type: 'string',
				default: 'Select one',
			},
		},
	} )
);
