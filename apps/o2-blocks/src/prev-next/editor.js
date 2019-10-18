/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';

const blockAttributes = {
	prev: {
		type: 'string',
		source: 'attribute',
		selector: 'a:first-child',
		attribute: 'href',
	},
	next: {
		type: 'string',
		source: 'attribute',
		selector: 'a:last-child',
		attribute: 'href',
	},
};

const save = ( { attributes: { prev, next }, className, isEditor } ) =>
	prev || next ? (
		<div className={ isEditor ? className : '' }>
			{ prev ? <a href={ prev }>← Prev</a> : <span> </span> }
			{ next ? <a href={ next }>Next →</a> : <span> </span> }
		</div>
	) : (
		<Fragment />
	);

const edit = ( { attributes, className, isSelected, setAttributes } ) => {
	if ( isSelected ) {
		return (
			<Fragment>
				<TextControl
					label={ __( 'Previous Post' ) }
					value={ attributes.prev }
					onChange={ prev => setAttributes( { prev } ) }
				/>
				<TextControl
					label={ __( 'Next Post' ) }
					value={ attributes.next }
					onChange={ next => setAttributes( { next } ) }
				/>
			</Fragment>
		);
	}

	if ( attributes.prev || attributes.next ) {
		return save( { attributes, className, isEditor: true } );
	}

	return (
		<div style={ { textAlign: 'center' } }>
			← { __( 'Add prev/next links to related posts in a series.' ) } →
		</div>
	);
};

registerBlockType( 'a8c/prev-next', {
	title: __( 'Prev/Next Links' ),
	icon: 'leftright',
	category: 'a8c',
	description: __( 'Link this post to sequential posts in a series of related posts.' ),
	keywords: [ __( 'links' ) ],
	attributes: blockAttributes,
	edit,
	save,
} );
