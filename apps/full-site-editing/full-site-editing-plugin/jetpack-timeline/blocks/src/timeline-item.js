/**
 * External dependencies
 */

import { InspectorControls, InnerBlocks, PanelColorSettings } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TimelineIcon } from './icon';

export function registerTimelineItemBlock() {
	registerBlockType( 'jetpack/timeline-item', {
		title: __( 'Timeline Entry', 'full-site-editing' ),
		description: __( 'An entry on the timeline', 'full-site-editing' ),
		icon: TimelineIcon,
		category: 'widgets',
		parent: [ 'jetpack/timeline' ],
		edit: ( { attributes, setAttributes } ) => {
			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			return (
				<li style={ style }>
					<InspectorControls>
						<PanelColorSettings
							title={ __( 'Color Settings', 'full-site-editing' ) }
							colorSettings={ [
								{
									value: attributes.background,
									onChange: ( background ) => setAttributes( { background } ),
									label: __( 'Background Color', 'full-site-editing' ),
								},
							] }
						/>
					</InspectorControls>
					<div className="timeline-item">
						<div className="timeline-item__bubble" style={ bubbleStyle } />
						<div className="timeline-item__dot" style={ style } />
						<InnerBlocks template={ [ [ 'core/heading' ] ] } />
					</div>
				</li>
			);
		},
		save: ( { attributes } ) => {
			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			return (
				<li style={ style }>
					<div className="timeline-item">
						<div className="timeline-item__bubble" style={ bubbleStyle } />
						<div className="timeline-item__dot" style={ style } />
						<InnerBlocks.Content />
					</div>
				</li>
			);
		},
		attributes: {
			background: {
				type: 'string',
				default: '#eeeeee',
			},
		},
	} );
}
