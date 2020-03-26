/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { URLInput } from '@wordpress/block-editor';

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
	prevText: {
		type: 'string',
		source: 'attribute',
		selector: 'a:first-child',
		attribute: 'title',
	},
	next: {
		type: 'string',
		source: 'attribute',
		selector: 'a:last-child',
		attribute: 'href',
	},
	nextText: {
		type: 'string',
		source: 'attribute',
		selector: 'a:last-child',
		attribute: 'title',
	},
};

const save = ( { attributes: { prev, prevText, next, nextText }, className, isEditor } ) =>
	prev || next ? (
		<div className={ isEditor ? className : '' }>
			{ prev ? (
				<a href={ prev } title={ prevText }>
					← { prevText }
				</a>
			) : (
				<span> </span>
			) }
			{ next ? (
				<a href={ next } title={ nextText }>
					{ nextText } →
				</a>
			) : (
				<span> </span>
			) }
		</div>
	) : (
		<Fragment />
	);

const edit = ( { attributes, className, isSelected, setAttributes } ) => {
	if ( isSelected ) {
		return (
			<Fragment>
				<URLInput
					value={ attributes.prev }
					onChange={ ( url, post ) =>
						setAttributes( { prev: url, prevText: post?.title || 'Prev' } )
					}
				/>
				<URLInput
					value={ attributes.next }
					onChange={ ( url, post ) =>
						setAttributes( { next: url, nextText: post?.title || 'Next' } )
					}
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
