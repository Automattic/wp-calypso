/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { ToggleControl, PanelBody } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { BlockAppender } from './block-appender';
import { TimelineIcon } from './icon';

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
				type: 'attribute',
				selector: 'ul',
				attribute: 'data-is-alternating',
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
					<InspectorControls>
						<PanelBody title={ __( 'Timeline settings', 'full-site-editing' ) }>
							<ToggleControl
								label={ __( 'Alternate items', 'full-site-editing' ) }
								onChange={ toggleAlternate }
								checked={ isAlternating }
							/>
						</PanelBody>
					</InspectorControls>
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
			const { isAlternating } = attributes;
			const classes = classnames( 'wp-block-jetpack-timeline', {
				'is-alternating': isAlternating,
			} );

			const dataAttr =
				typeof isAlternating === 'boolean' ? { 'data-is-alternating': isAlternating } : null;

			return (
				<ul className={ classes } { ...dataAttr }>
					<InnerBlocks.Content />
				</ul>
			);
		},
	} );
}
