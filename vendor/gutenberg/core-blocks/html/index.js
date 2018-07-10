/**
 * WordPress dependencies
 */
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { withState, Disabled, SandBox, CodeEditor } from '@wordpress/components';
import { getPhrasingContentSchema } from '@wordpress/blocks';
import { BlockControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './editor.scss';

export const name = 'core/html';

export const settings = {
	title: __( 'Custom HTML' ),

	description: __( 'Add your own HTML (and view it right here as you edit!).' ),

	icon: 'html',

	category: 'formatting',

	keywords: [ __( 'embed' ) ],

	supports: {
		customClassName: false,
		className: false,
		html: false,
	},

	attributes: {
		content: {
			type: 'string',
			source: 'html',
		},
	},

	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node ) => node.nodeName === 'FIGURE' && !! node.querySelector( 'iframe' ),
				schema: {
					figure: {
						require: [ 'iframe' ],
						children: {
							iframe: {
								attributes: [ 'src', 'allowfullscreen', 'height', 'width' ],
							},
							figcaption: {
								children: getPhrasingContentSchema(),
							},
						},
					},
				},
			},
		],
	},

	edit: withState( {
		isPreview: false,
	} )( ( { attributes, setAttributes, setState, isSelected, toggleSelection, isPreview } ) => (
		<div className="wp-block-html">
			<BlockControls>
				<div className="components-toolbar">
					<button
						className={ `components-tab-button ${ ! isPreview ? 'is-active' : '' }` }
						onClick={ () => setState( { isPreview: false } ) }
					>
						<span>HTML</span>
					</button>
					<button
						className={ `components-tab-button ${ isPreview ? 'is-active' : '' }` }
						onClick={ () => setState( { isPreview: true } ) }
					>
						<span>{ __( 'Preview' ) }</span>
					</button>
				</div>
			</BlockControls>
			<Disabled.Consumer>
				{ ( isDisabled ) => (
					( isPreview || isDisabled ) ? (
						<SandBox html={ attributes.content } />
					) : (
						<CodeEditor
							value={ attributes.content }
							focus={ isSelected }
							onFocus={ toggleSelection }
							onChange={ ( content ) => setAttributes( { content } ) }
						/>
					)
				) }
			</Disabled.Consumer>
		</div>
	) ),

	save( { attributes } ) {
		return <RawHTML>{ attributes.content }</RawHTML>;
	},
};
