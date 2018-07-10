/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { createBlobURL } from '@wordpress/blob';
import { createBlock } from '@wordpress/blocks';
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';

export const name = 'core/file';

export const settings = {
	title: __( 'File' ),

	description: __( 'Add a link to a file that visitors can download.' ),

	icon: 'media-default',

	category: 'common',

	keywords: [ __( 'document' ), __( 'pdf' ) ],

	attributes: {
		id: {
			type: 'number',
		},
		href: {
			type: 'string',
		},
		fileName: {
			type: 'string',
			source: 'text',
			selector: 'a:not([download])',
		},
		// Differs to the href when the block is configured to link to the attachment page
		textLinkHref: {
			type: 'string',
			source: 'attribute',
			selector: 'a:not([download])',
			attribute: 'href',
		},
		// e.g. `_blank` when the block is configured to open in a new window
		textLinkTarget: {
			type: 'string',
			source: 'attribute',
			selector: 'a:not([download])',
			attribute: 'target',
		},
		showDownloadButton: {
			type: 'boolean',
			default: true,
		},
		downloadButtonText: {
			type: 'string',
			source: 'text',
			selector: 'a[download]',
			default: __( 'Download' ),
		},
	},

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'files',
				isMatch: ( files ) => files.length === 1,
				transform: ( files ) => {
					const file = files[ 0 ];
					const blobURL = createBlobURL( file );

					// File will be uploaded in componentDidMount()
					return createBlock( 'core/file', {
						href: blobURL,
						fileName: file.name,
						textLinkHref: blobURL,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/audio' ],
				transform: ( attributes ) => {
					return createBlock( 'core/file', {
						href: attributes.src,
						fileName: attributes.caption && attributes.caption.join(),
						textLinkHref: attributes.src,
						id: attributes.id,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/video' ],
				transform: ( attributes ) => {
					return createBlock( 'core/file', {
						href: attributes.src,
						fileName: attributes.caption && attributes.caption.join(),
						textLinkHref: attributes.src,
						id: attributes.id,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/audio' ],
				isMatch: ( { id } ) => {
					if ( ! id ) {
						return false;
					}
					const { getMedia } = select( 'core' );
					const media = getMedia( id );
					return !! media && includes( media.mime_type, 'audio' );
				},
				transform: ( attributes ) => {
					return createBlock( 'core/audio', {
						src: attributes.href,
						caption: [ attributes.fileName ],
						id: attributes.id,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/video' ],
				isMatch: ( { id } ) => {
					if ( ! id ) {
						return false;
					}
					const { getMedia } = select( 'core' );
					const media = getMedia( id );
					return !! media && includes( media.mime_type, 'video' );
				},
				transform: ( attributes ) => {
					return createBlock( 'core/video', {
						src: attributes.href,
						caption: [ attributes.fileName ],
						id: attributes.id,
					} );
				},
			},
		],
	},

	edit,

	save( { attributes } ) {
		const {
			href,
			fileName,
			textLinkHref,
			textLinkTarget,
			showDownloadButton,
			downloadButtonText,
		} = attributes;

		return ( href &&
			<div>
				{ fileName &&
					<a
						href={ textLinkHref }
						target={ textLinkTarget }
						rel={ textLinkTarget ? 'noreferrer noopener' : false }
					>
						{ fileName }
					</a>
				}
				{ showDownloadButton &&
					<a
						href={ href }
						className="wp-block-file__button"
						download={ fileName }>
						{ downloadButtonText }
					</a>
				}
			</div>
		);
	},

};
