/**
 * External dependencies
 */
import { get, times } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, RangeControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import {
	BlockControls,
	BlockAlignmentToolbar,
	InspectorControls,
	RichText,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';

export const name = 'core/text-columns';

export const settings = {
	title: __( 'Text Columns' ),

	description: __( 'Add text, and display it in two or more columns. Like a newspaper! This block is experimental.' ),

	icon: 'columns',

	category: 'layout',

	attributes: {
		content: {
			type: 'array',
			source: 'query',
			selector: 'p',
			query: {
				children: {
					source: 'children',
				},
			},
			default: [ [], [] ],
		},
		columns: {
			type: 'number',
			default: 2,
		},
		width: {
			type: 'string',
		},
	},

	getEditWrapperProps( attributes ) {
		const { width } = attributes;
		if ( 'wide' === width || 'full' === width ) {
			return { 'data-align': width };
		}
	},

	edit: ( ( { attributes, setAttributes, className } ) => {
		const { width, content, columns } = attributes;

		return (
			<Fragment>
				<BlockControls>
					<BlockAlignmentToolbar
						value={ width }
						onChange={ ( nextWidth ) => setAttributes( { width: nextWidth } ) }
						controls={ [ 'center', 'wide', 'full' ] }
					/>
				</BlockControls>
				<InspectorControls>
					<PanelBody>
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( value ) => setAttributes( { columns: value } ) }
							min={ 2 }
							max={ 4 }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ `${ className } align${ width } columns-${ columns }` }>
					{ times( columns, ( index ) => {
						return (
							<div className="wp-block-column" key={ `column-${ index }` }>
								<RichText
									tagName="p"
									value={ get( content, [ index, 'children' ] ) }
									onChange={ ( nextContent ) => {
										setAttributes( {
											content: [
												...content.slice( 0, index ),
												{ children: nextContent },
												...content.slice( index + 1 ),
											],
										} );
									} }
									placeholder={ __( 'New Column' ) }
								/>
							</div>
						);
					} ) }
				</div>
			</Fragment>
		);
	} ),

	save( { attributes } ) {
		const { width, content, columns } = attributes;
		return (
			<div className={ `align${ width } columns-${ columns }` }>
				{ times( columns, ( index ) =>
					<div className="wp-block-column" key={ `column-${ index }` }>
						<RichText.Content tagName="p" value={ get( content, [ index, 'children' ] ) } />
					</div>
				) }
			</div>
		);
	},
};
