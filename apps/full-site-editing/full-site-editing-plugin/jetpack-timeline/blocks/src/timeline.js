/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

/**
 * External dependencies
 */

import { InnerBlocks, BlockControls } from '@wordpress/block-editor';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { TimelineIcon } from './icon';
import { BlockAppender } from './block-appender';
import { ToolbarButton } from '@wordpress/components';

export function registerTimelineBlock() {
	registerBlockType( 'jetpack/timeline', {
		title: __( 'Timeline', 'full-site-editing' ),
		description: __( 'Create a timeline of events.', 'full-site-editing' ),
		icon: TimelineIcon,
		category: 'widgets',
		example: {
			innerBlocks: [
				{
					name: 'jetpack/timeline-item',
					innerBlocks: [
						{
							name: 'core/heading',
							attributes: {
								content: __( 'Spring', 'full-site-editing' ),
							},
						},
					],
				},
				{
					name: 'jetpack/timeline-item',
					innerBlocks: [
						{
							name: 'core/heading',
							attributes: {
								content: __( 'Summer', 'full-site-editing' ),
							},
						},
					],
				},
				{
					name: 'jetpack/timeline-item',
					innerBlocks: [
						{
							name: 'core/heading',
							attributes: {
								content: __( 'Fall', 'full-site-editing' ),
							},
						},
					],
				},
				{
					name: 'jetpack/timeline-item',
					innerBlocks: [
						{
							name: 'core/heading',
							attributes: {
								content: __( 'Winter', 'full-site-editing' ),
							},
						},
					],
				},
			],
		},
		attributes: {
			isAlternating: {
				type: 'boolean',
				default: false,
			},
		},
		edit: ( props ) => {
			const { clientId, attributes, setAttributes } = props;
			const { isAlternating } = attributes;

			const addItem = () => {
				const block = createBlock( 'jetpack/timeline-item' );
				dispatch( 'core/block-editor' ).insertBlock( block, undefined, clientId );
			};

			const toggleAlternate = () => setAttributes( { isAlternating: ! isAlternating } );

			const classes = classnames( 'wp-block-jetpack-timeline', {
				'is-alternating': isAlternating,
			} );

			return (
				<>
					<BlockControls>
						<ToolbarButton onClick={ toggleAlternate }>Toggle Alternating</ToolbarButton>
					</BlockControls>
					<ul className={ classes }>
						<InnerBlocks
							allowedBlocks={ [ 'jetpack/timeline-item' ] }
							template={ [ [ 'jetpack/timeline-item' ] ] }
							renderAppender={ () => <BlockAppender onClick={ addItem } /> }
						/>
					</ul>
				</>
			);
		},

		save: ( props ) => {
			const { attributes } = props;
			const classes = classnames( 'wp-block-jetpack-timeline', {
				'is-alternating': attributes.isAlternating,
			} );

			return (
				<ul className={ classes }>
					<InnerBlocks.Content />
				</ul>
			);
		},
	} );
}
