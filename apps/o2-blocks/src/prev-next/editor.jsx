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

const clampString = ( s, maxLength, tolerance = 4 ) => {
	const codePoints = [ ...s ];

	// add some hysteresis to prevent awkward cutoffs
	const trimmed =
		s.length > maxLength + tolerance ? [ ...codePoints.slice( 0, maxLength ), '…' ] : codePoints;

	return trimmed.join( '' );
};

const save = ( { attributes: { prev, prevText, next, nextText }, className, isEditor } ) => {
	if ( prev || next ) {
		const prevTitle = clampString( prevText || '', 28 );
		const nextTitle = clampString( nextText || '', 28 );

		return (
			<div className={ isEditor ? className : '' }>
				{ prev ? (
					<a href={ prev } title={ prevText } disabled={ isEditor }>
						← { prevTitle }
					</a>
				) : (
					<span> </span>
				) }
				{ next ? (
					<a
						href={ next }
						title={ nextText }
						disabled={ isEditor }
						style={ prev ? { float: 'right' } : {} }
					>
						{ nextTitle } →
					</a>
				) : (
					<span> </span>
				) }
			</div>
		);
	}

	return <Fragment />;
};

const edit = ( { attributes, className, isSelected, setAttributes } ) => {
	if ( isSelected ) {
		return (
			<Fragment>
				<URLInput
					className="prev-next__link-entry"
					autoFocus
					label="Previous link"
					value={ attributes.prev }
					onChange={ ( url, post ) =>
						setAttributes( { prev: url, prevText: post?.title || 'Prev' } )
					}
				/>
				<URLInput
					className="prev-next__link-entry"
					label="Next link"
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

const save_v1 = ( { attributes: { prev, next }, className, isEditor } ) =>
	prev || next ? (
		<div className={ isEditor ? className : '' }>
			{ prev ? <a href={ prev }>← Prev</a> : <span> </span> }
			{ next ? <a href={ next }>Next →</a> : <span> </span> }
		</div>
	) : (
		<Fragment />
	);

const deprecations = [
	{
		attributes: {
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
		},
		migrate: ( { prev, next } ) => ( {
			prev,
			prevText: 'Prev',
			next,
			nextText: 'Next',
		} ),
		save: save_v1,
	},
];

registerBlockType( 'a8c/prev-next', {
	title: __( 'Prev/Next Links' ),
	icon: 'leftright',
	category: 'a8c',
	description: __( 'Link this post to sequential posts in a series of related posts.' ),
	keywords: [ __( 'links' ) ],
	attributes: blockAttributes,
	edit,
	save,
	deprecated: deprecations,
} );
