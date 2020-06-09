/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useCallback } from '@wordpress/element';
import { Button, ButtonGroup, PanelBody, RangeControl } from '@wordpress/components';
import { InspectorControls, RichText, __experimentalBlock as Block } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ColorEdit from './color-edit';
import getColorAndStyleProps from './color-props';

const MIN_BORDER_RADIUS_VALUE = 0;
const MAX_BORDER_RADIUS_VALUE = 50;
const INITIAL_BORDER_RADIUS_POSITION = 5;

function BorderPanel( { borderRadius = '', setAttributes } ) {
	const setBorderRadius = useCallback(
		( newBorderRadius ) => {
			setAttributes( { borderRadius: newBorderRadius } );
		},
		[ setAttributes ]
	);
	return (
		<PanelBody title={ __( 'Border settings', 'full-site-editing' ) }>
			<RangeControl
				value={ borderRadius }
				label={ __( 'Border radius', 'full-site-editing' ) }
				min={ MIN_BORDER_RADIUS_VALUE }
				max={ MAX_BORDER_RADIUS_VALUE }
				initialPosition={ INITIAL_BORDER_RADIUS_POSITION }
				allowReset
				onChange={ setBorderRadius }
			/>
		</PanelBody>
	);
}

const BUTTON_TYPES = {
	subscribe: __( 'Subscribe', 'full-site-editing' ),
	login: __( 'Log in', 'full-site-editing' ),
};

function ButtonEdit( props ) {
	const { attributes, setAttributes, className } = props;
	const { borderRadius, text, type } = attributes;

	const colorProps = getColorAndStyleProps( attributes );

	return (
		<>
			{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
			<Block.div className="wp-block-button">
				<RichText
					placeholder={ __( 'Add text…', 'full-site-editing' ) }
					value={ text }
					onChange={ ( value ) => setAttributes( { text: value } ) }
					withoutInteractiveFormatting
					className={ classnames( className, 'wp-block-button__link', colorProps.className, {
						'no-border-radius': borderRadius === 0,
					} ) }
					style={ {
						borderRadius: borderRadius ? borderRadius + 'px' : undefined,
						...colorProps.style,
					} }
				/>
			</Block.div>
			<InspectorControls>
				<PanelBody title={ __( 'Button Type', 'full-site-editing' ) }>
					<ButtonGroup aria-label={ __( 'Button Type', 'full-site-editing' ) }>
						{ Object.entries( BUTTON_TYPES ).map( ( [ buttonType, buttonText ] ) => (
							<Button
								key={ buttonType }
								isLarge
								isPrimary={ type === buttonType }
								aria-pressed={ type === buttonType }
								onClick={ () =>
									setAttributes( {
										type: buttonType,
										text: buttonText,
									} )
								}
							>
								{ buttonText }
							</Button>
						) ) }
					</ButtonGroup>
				</PanelBody>
				<ColorEdit { ...props } />
				<BorderPanel borderRadius={ borderRadius } setAttributes={ setAttributes } />
			</InspectorControls>
		</>
	);
}

export default ButtonEdit;
