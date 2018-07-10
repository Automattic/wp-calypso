/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	createBlock,
	getBlockAttributes,
	getBlockType,
	getPhrasingContentSchema,
} from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';
import { createBlobURL } from '@wordpress/blob';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';

export const name = 'core/image';

const blockAttributes = {
	url: {
		type: 'string',
		source: 'attribute',
		selector: 'img',
		attribute: 'src',
	},
	alt: {
		type: 'string',
		source: 'attribute',
		selector: 'img',
		attribute: 'alt',
		default: '',
	},
	caption: {
		type: 'array',
		source: 'children',
		selector: 'figcaption',
	},
	href: {
		type: 'string',
		source: 'attribute',
		selector: 'figure > a',
		attribute: 'href',
	},
	id: {
		type: 'number',
	},
	align: {
		type: 'string',
	},
	width: {
		type: 'number',
	},
	height: {
		type: 'number',
	},
	linkDestination: {
		type: 'string',
		default: 'none',
	},
};

const imageSchema = {
	img: {
		attributes: [ 'src', 'alt' ],
		classes: [ 'alignleft', 'aligncenter', 'alignright', 'alignnone', /^wp-image-\d+$/ ],
	},
};

const schema = {
	figure: {
		require: [ 'img' ],
		children: {
			...imageSchema,
			a: {
				attributes: [ 'href' ],
				children: imageSchema,
			},
			figcaption: {
				children: getPhrasingContentSchema(),
			},
		},
	},
};

export const settings = {
	title: __( 'Image' ),

	description: __( 'They\'re worth 1,000 words! Insert a single image.' ),

	icon: 'format-image',

	category: 'common',

	keywords: [ __( 'photo' ) ],

	attributes: blockAttributes,

	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node ) => node.nodeName === 'FIGURE' && !! node.querySelector( 'img' ),
				schema,
				transform: ( node ) => {
					// Search both figure and image classes. Alignment could be
					// set on either. ID is set on the image.
					const className = node.className + ' ' + node.querySelector( 'img' ).className;
					const alignMatches = /(?:^|\s)align(left|center|right)(?:$|\s)/.exec( className );
					const align = alignMatches ? alignMatches[ 1 ] : undefined;
					const idMatches = /(?:^|\s)wp-image-(\d+)(?:$|\s)/.exec( className );
					const id = idMatches ? idMatches[ 1 ] : undefined;
					const anchorElement = node.querySelector( 'a' );
					const linkDestination = anchorElement && anchorElement.href ? 'custom' : undefined;
					const href = anchorElement && anchorElement.href ? anchorElement.href : undefined;
					const blockType = getBlockType( 'core/image' );
					const attributes = getBlockAttributes( blockType, node.outerHTML, { align, id, linkDestination, href } );
					return createBlock( 'core/image', attributes );
				},
			},
			{
				type: 'files',
				isMatch( files ) {
					return files.length === 1 && files[ 0 ].type.indexOf( 'image/' ) === 0;
				},
				transform( files ) {
					const file = files[ 0 ];
					// We don't need to upload the media directly here
					// It's already done as part of the `componentDidMount`
					// int the image block
					const block = createBlock( 'core/image', {
						url: createBlobURL( file ),
					} );

					return block;
				},
			},
			{
				type: 'shortcode',
				tag: 'caption',
				attributes: {
					url: {
						type: 'string',
						source: 'attribute',
						attribute: 'src',
						selector: 'img',
					},
					alt: {
						type: 'string',
						source: 'attribute',
						attribute: 'alt',
						selector: 'img',
					},
					caption: {
						type: 'array',
						// To do: needs to support HTML.
						source: 'text',
					},
					href: {
						type: 'string',
						source: 'attribute',
						attribute: 'href',
						selector: 'a',
					},
					id: {
						type: 'number',
						shortcode: ( { named: { id } } ) => {
							if ( ! id ) {
								return;
							}

							return parseInt( id.replace( 'attachment_', '' ), 10 );
						},
					},
					align: {
						type: 'string',
						shortcode: ( { named: { align = 'alignnone' } } ) => {
							return align.replace( 'align', '' );
						},
					},
				},
			},
		],
	},

	getEditWrapperProps( attributes ) {
		const { align, width } = attributes;
		if ( 'left' === align || 'center' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align, 'data-resized': !! width };
		}
	},

	edit,

	save( { attributes } ) {
		const { url, alt, caption, align, href, width, height, id } = attributes;

		const classes = classnames( {
			[ `align${ align }` ]: align,
			'is-resized': width || height,
		} );

		const image = (
			<img
				src={ url }
				alt={ alt }
				className={ id ? `wp-image-${ id }` : null }
				width={ width }
				height={ height }
			/>
		);

		return (
			<figure className={ classes }>
				{ href ? <a href={ href }>{ image }</a> : image }
				{ caption && caption.length > 0 && <RichText.Content tagName="figcaption" value={ caption } /> }
			</figure>
		);
	},

	deprecated: [
		{
			attributes: blockAttributes,
			save( { attributes } ) {
				const { url, alt, caption, align, href, width, height, id } = attributes;

				const image = (
					<img
						src={ url }
						alt={ alt }
						className={ id ? `wp-image-${ id }` : null }
						width={ width }
						height={ height }
					/>
				);

				return (
					<figure className={ align ? `align${ align }` : null } >
						{ href ? <a href={ href }>{ image }</a> : image }
						{ caption && caption.length > 0 && <RichText.Content tagName="figcaption" value={ caption } /> }
					</figure>
				);
			},
		},
		{
			attributes: blockAttributes,
			save( { attributes } ) {
				const { url, alt, caption, align, href, width, height } = attributes;
				const extraImageProps = width || height ? { width, height } : {};
				const image = <img src={ url } alt={ alt } { ...extraImageProps } />;

				let figureStyle = {};

				if ( width ) {
					figureStyle = { width };
				} else if ( align === 'left' || align === 'right' ) {
					figureStyle = { maxWidth: '50%' };
				}

				return (
					<figure className={ align ? `align${ align }` : null } style={ figureStyle }>
						{ href ? <a href={ href }>{ image }</a> : image }
						{ caption && caption.length > 0 && <RichText.Content tagName="figcaption" value={ caption } /> }
					</figure>
				);
			},
		},
	],
};
