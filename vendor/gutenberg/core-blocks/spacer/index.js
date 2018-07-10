/**
 * External dependencies
 */
import ResizableBox from 're-resizable';

/**
 * WordPress
 */
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/editor';
import { BaseControl, PanelBody, withInstanceId } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';

export const name = 'core/spacer';

export const settings = {
	title: __( 'Spacer' ),

	description: __( 'Add an element with empty space and custom height.' ),

	icon: 'image-flip-vertical',

	category: 'layout',

	attributes: {
		height: {
			type: 'number',
			default: 100,
		},
	},

	edit: withInstanceId(
		( { attributes, setAttributes, toggleSelection, instanceId } ) => {
			const { height } = attributes;
			const id = `block-spacer-height-input-${ instanceId }`;

			return (
				<Fragment>
					<ResizableBox
						size={ {
							height,
						} }
						minHeight="20"
						handleClasses={ {
							top: 'core-blocks-spacer__resize-handler-top',
							bottom: 'core-blocks-spacer__resize-handler-bottom',
						} }
						enable={ {
							top: false,
							right: false,
							bottom: true,
							left: false,
							topRight: false,
							bottomRight: false,
							bottomLeft: false,
							topLeft: false,
						} }
						onResizeStop={ ( event, direction, elt, delta ) => {
							setAttributes( {
								height: parseInt( height + delta.height, 10 ),
							} );
							toggleSelection( true );
						} }
						onResizeStart={ () => {
							toggleSelection( false );
						} }
					/>
					<InspectorControls>
						<PanelBody title={ __( 'Spacer Settings' ) }>
							<BaseControl label={ __( 'Height in pixels' ) } id={ id }>
								<input
									type="number"
									id={ id }
									onChange={ ( event ) => {
										setAttributes( {
											height: parseInt( event.target.value, 10 ),
										} );
									} }
									value={ height }
									min="20"
									step="10"
								/>
							</BaseControl>
						</PanelBody>
					</InspectorControls>
				</Fragment>
			);
		}
	),

	save( { attributes } ) {
		return <div style={ { height: attributes.height } } aria-hidden />;
	},
};
