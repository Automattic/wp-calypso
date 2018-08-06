/** @format */
/**
 * External dependencies
 */
import wp from 'wp';
const { __ } = wp.i18n;
const { TextControl } = wp.components;
const { registerBlockType } = wp.blocks;

/**
 * Internal dependencies
 */
import './style.scss';

const blockAttributes = {
	prev: {
		type: 'string',
		source: 'attribute',
		selector: 'a:first-child',
		attribute: 'href'
	},
	next: {
		type: 'string',
		source: 'attribute',
		selector: 'a:last-child',
		attribute: 'href'
	},
};

const save = ( { attributes: { prev, next }, className, isEditor } ) => (
	prev || next ? (
		<div className={ isEditor ? className : '' }>
			{prev ? <a href={prev}>← Prev</a> : <span> </span>}
			{next ? <a href={next}>Next →</a> : <span> </span>}
		</div>
	) : (
		<React.Fragment/>
	)
);

registerBlockType( 'a8c/prev-next', {
	title: __( 'Prev/Next Links' ),
	icon: 'leftright',
	category: 'common',
	description: __( 'Link this post to sequential posts in a series of related posts.'),
	keywords: [ __( 'links' ) ],
	attributes: blockAttributes,
	edit: ( { attributes, className, isSelected, setAttributes } ) => (
		isSelected ? (
			<React.Fragment>
				<TextControl
					label={__( 'Previous Post' )}
					value={attributes.prev}
					onChange={prev => setAttributes( { prev } )}
				/>
				<TextControl
					label={__( 'Next Post' )}
					value={attributes.next}
					onChange={next => setAttributes( { next } )}
				/>
			</React.Fragment>
		) : (
			(attributes.prev || attributes.next)
				? save( { attributes, className, isEditor: true } )
				: <div style={{ textAlign: 'center' }}>← Add prev/next links to related posts in a series. →</div>
		)
	),
	save
} );
