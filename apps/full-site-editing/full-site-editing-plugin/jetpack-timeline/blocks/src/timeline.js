/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

/**
 * External dependencies
 */

import { InnerBlocks } from '@wordpress/block-editor';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TimelineIcon } from './icon';
import { BlockAppender } from './block-appender';

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
		edit: ( props ) => {
			const { clientId } = props;

			const addItem = () => {
				const block = createBlock( 'jetpack/timeline-item' );
				dispatch( 'core/block-editor' ).insertBlock( block, undefined, clientId );
			};

			return (
				<>
					<ul className="wp-block-jetpack-timeline">
						<InnerBlocks
							allowedBlocks={ [ 'jetpack/timeline-item' ] }
							template={ [ [ 'jetpack/timeline-item' ] ] }
							renderAppender={ () => <BlockAppender onClick={ addItem } /> }
						/>
					</ul>
				</>
			);
		},

		save: () => {
			return (
				<ul className="wp-block-jetpack-timeline">
					<InnerBlocks.Content />
				</ul>
			);
		},
	} );
}
