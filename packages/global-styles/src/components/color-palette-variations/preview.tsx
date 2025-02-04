import { __experimentalHStack as HStack } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import {
	STYLE_PREVIEW_WIDTH,
	STYLE_PREVIEW_HEIGHT,
	STYLE_PREVIEW_COLOR_SWATCH_SIZE,
} from '../../constants';
import { useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';

const ColorPaletteVariationPreview = () => {
	const [ textColor = 'black' ] = useGlobalStyle( 'color.text' );
	const [ buttonColor = textColor ] = useGlobalStyle( 'elements.button.color.background' );
	const [ backgroundColor = 'white' ] = useGlobalStyle( 'color.background' );
	const [ gradientValue ] = useGlobalStyle( 'color.gradient' );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / STYLE_PREVIEW_WIDTH : 1;
	const normalizedHeight = Math.ceil( STYLE_PREVIEW_HEIGHT * ratio );
	const normalizedSwatchSize = STYLE_PREVIEW_COLOR_SWATCH_SIZE * ratio * 2;

	return (
		<GlobalStylesVariationContainer
			width={ width }
			height={ normalizedHeight }
			containerResizeListener={ containerResizeListener }
		>
			<div
				style={ {
					// Apply the normalized height only when the width is available
					height: width ? normalizedHeight : 0,
					width: '100%',
					background: gradientValue ?? backgroundColor,
					cursor: 'pointer',
				} }
			>
				<div
					style={ {
						height: '100%',
						overflow: 'hidden',
					} }
				>
					<HStack
						spacing={ 10 * ratio }
						justify="center"
						style={ {
							height: '100%',
							overflow: 'hidden',
						} }
					>
						{ [ textColor, buttonColor ].map( ( color, index ) => (
							<div
								key={ index }
								style={ {
									height: normalizedSwatchSize,
									width: normalizedSwatchSize,
									background: color,
									borderRadius: normalizedSwatchSize / 2,
								} }
							/>
						) ) }
					</HStack>
				</div>
			</div>
		</GlobalStylesVariationContainer>
	);
};

export default ColorPaletteVariationPreview;
