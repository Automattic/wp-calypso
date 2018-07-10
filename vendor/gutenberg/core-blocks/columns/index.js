/**
 * External dependencies
 */
import { times, property, omit } from 'lodash';
import classnames from 'classnames';
import memoize from 'memize';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { PanelBody, RangeControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import {
	InspectorControls,
	InnerBlocks,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'core/column' ];

/**
 * Returns the layouts configuration for a given number of columns.
 *
 * @param {number} columns Number of columns.
 *
 * @return {Object[]} Columns layout configuration.
 */
const getColumnsTemplate = memoize( ( columns ) => {
	return times( columns, () => [ 'core/column' ] );
} );

export const name = 'core/columns';

export const settings = {
	title: sprintf(
		/* translators: Block title modifier */
		__( '%1$s (%2$s)' ),
		__( 'Columns' ),
		__( 'beta' )
	),

	icon: 'columns',

	category: 'layout',

	attributes: {
		columns: {
			type: 'number',
			default: 2,
		},
	},

	description: __( 'Add a block that displays content in multiple columns, then add whatever content blocks you\'d like.' ),

	supports: {
		align: [ 'wide', 'full' ],
	},

	deprecated: [
		{
			attributes: {
				columns: {
					type: 'number',
					default: 2,
				},
			},
			isEligible( attributes, innerBlocks ) {
				return innerBlocks.some( property( [ 'attributes', 'layout' ] ) );
			},
			migrate( attributes, innerBlocks ) {
				function withoutLayout( block ) {
					return {
						...block,
						attributes: omit( block.attributes, [ 'layout' ] ),
					};
				}

				const columns = innerBlocks.reduce( ( result, innerBlock ) => {
					const { layout } = innerBlock.attributes;

					let columnIndex, columnMatch;
					if ( layout && ( columnMatch = layout.match( /^column-(\d+)$/ ) ) ) {
						columnIndex = Number( columnMatch[ 1 ] ) - 1;
					} else {
						columnIndex = 0;
					}

					if ( ! result[ columnIndex ] ) {
						result[ columnIndex ] = [];
					}

					result[ columnIndex ].push( withoutLayout( innerBlock ) );

					return result;
				}, [] );

				const migratedInnerBlocks = columns.map( ( columnBlocks ) => (
					createBlock( 'core/column', {}, columnBlocks )
				) );

				return [
					attributes,
					migratedInnerBlocks,
				];
			},
			save( { attributes } ) {
				const { columns } = attributes;

				return (
					<div className={ `has-${ columns }-columns` }>
						<InnerBlocks.Content />
					</div>
				);
			},
		},
	],

	edit( { attributes, setAttributes, className } ) {
		const { columns } = attributes;
		const classes = classnames( className, `has-${ columns }-columns` );

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody>
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( nextColumns ) => {
								setAttributes( {
									columns: nextColumns,
								} );
							} }
							min={ 2 }
							max={ 6 }
						/>
					</PanelBody>
				</InspectorControls>
				<div className={ classes }>
					<InnerBlocks
						template={ getColumnsTemplate( columns ) }
						templateLock="all"
						allowedBlocks={ ALLOWED_BLOCKS } />
				</div>
			</Fragment>
		);
	},

	save( { attributes } ) {
		const { columns } = attributes;

		return (
			<div className={ `has-${ columns }-columns` }>
				<InnerBlocks.Content />
			</div>
		);
	},
};
