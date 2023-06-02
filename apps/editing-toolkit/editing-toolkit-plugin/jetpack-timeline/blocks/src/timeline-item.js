import {
	InspectorControls,
	InnerBlocks,
	PanelColorSettings,
	BlockControls,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { positionLeft, positionRight } from '@wordpress/icons';
import classnames from 'classnames';
import { TimelineIcon } from './icon';

const DEFAULT_BACKGROUND = '#eeeeee';

function Controls( { alignment, clientId, toggleAlignment } ) {
	const parentIsAlternating = useSelect( ( select ) => {
		const parentIds = select( 'core/block-editor' ).getBlockParents( clientId );
		const parent = select( 'core/block-editor' ).getBlock( parentIds[ 0 ] );
		return parent?.attributes?.isAlternating;
	} );

	if ( parentIsAlternating === false ) {
		return null;
	}

	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					onClick={ () => toggleAlignment( 'left' ) }
					isActive={ alignment === 'left' }
					icon={ positionLeft }
					title={ __( 'Left', 'full-site-editing' ) }
				/>
				<ToolbarButton
					onClick={ () => toggleAlignment( 'right' ) }
					isActive={ alignment === 'right' }
					icon={ positionRight }
					title={ __( 'Right', 'full-site-editing' ) }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}

export function registerTimelineItemBlock() {
	registerBlockType( 'jetpack/timeline-item', {
		title: __( 'Timeline Entry', 'full-site-editing' ),
		description: __( 'An entry on the timeline', 'full-site-editing' ),
		icon: TimelineIcon,
		category: 'widgets',
		parent: [ 'jetpack/timeline' ],
		edit: function Edit( { attributes, clientId, setAttributes } ) {
			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			const toggleAlignment = ( alignment ) => {
				const newAlignment = alignment === attributes.alignment ? 'auto' : alignment;
				setAttributes( { alignment: newAlignment } );
			};

			const classes = classnames( 'wp-block-jetpack-timeline-item', {
				'is-left': attributes.alignment === 'left',
				'is-right': attributes.alignment === 'right',
			} );

			return (
				<>
					<Controls
						alignment={ attributes.alignment }
						clientId={ clientId }
						toggleAlignment={ toggleAlignment }
					/>
					<li style={ style } className={ classes }>
						<InspectorControls>
							<PanelColorSettings
								title={ __( 'Color Settings', 'full-site-editing' ) }
								enableAlpha={ true }
								colorSettings={ [
									{
										value: attributes.background,
										onChange: ( background ) =>
											setAttributes( { background: background || DEFAULT_BACKGROUND } ),
										label: __( 'Background Color', 'full-site-editing' ),
									},
								] }
							/>
						</InspectorControls>
						<div className="timeline-item">
							<div className="timeline-item__bubble" style={ bubbleStyle } />
							<div className="timeline-item__dot" style={ style } />
							<InnerBlocks template={ [ [ 'core/paragraph' ] ] } />
						</div>
					</li>
				</>
			);
		},
		save: ( { attributes } ) => {
			const classes = classnames( {
				'is-left': attributes.alignment === 'left',
				'is-right': attributes.alignment === 'right',
			} );

			const style = {
				backgroundColor: attributes.background,
			};

			const bubbleStyle = {
				borderColor: attributes.background,
			};

			return (
				<li style={ style } className={ classes }>
					<div className="timeline-item">
						<div className="timeline-item__bubble" style={ bubbleStyle } />
						<div className="timeline-item__dot" style={ style } />
						<InnerBlocks.Content />
					</div>
				</li>
			);
		},
		attributes: {
			alignment: {
				type: 'string',
				default: 'auto',
			},
			background: {
				type: 'string',
				default: DEFAULT_BACKGROUND,
			},
		},
	} );
}
