import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import {
	STYLE_PREVIEW_WIDTH,
	STYLE_PREVIEW_HEIGHT,
	STYLE_PREVIEW_COLOR_SWATCH_SIZE,
} from '../../constants';
import { useGlobalSetting, useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import type { Color } from '../../types';

interface Props {
	title?: string;
}

const ColorPaletteVariationPreview = ( { title }: Props ) => {
	const [ fontWeight ] = useGlobalStyle( 'typography.fontWeight' );
	const [ fontFamily = 'serif' ] = useGlobalStyle( 'typography.fontFamily' );
	const [ headingFontFamily = fontFamily ] = useGlobalStyle( 'elements.h1.typography.fontFamily' );
	const [ headingFontWeight = fontWeight ] = useGlobalStyle( 'elements.h1.typography.fontWeight' );
	const [ textColor = 'black' ] = useGlobalStyle( 'color.text' );
	const [ headingColor = textColor ] = useGlobalStyle( 'elements.h1.color.text' );
	const [ backgroundColor = 'white' ] = useGlobalStyle( 'color.background' );
	const [ gradientValue ] = useGlobalStyle( 'color.gradient' );
	const [ themeColors ] = useGlobalSetting( 'color.palette.theme' );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / STYLE_PREVIEW_WIDTH : 1;
	const normalizedHeight = Math.ceil( STYLE_PREVIEW_HEIGHT * ratio );
	const normalizedSwatchSize = STYLE_PREVIEW_COLOR_SWATCH_SIZE * ratio * 2;
	const uniqueColors = [ ...new Set< string >( themeColors.map( ( { color }: Color ) => color ) ) ];
	const highlightedColors = uniqueColors
		.filter(
			// we exclude background color because it is already visible in the preview.
			( color ) => color !== backgroundColor
		)
		.slice( 0, 2 );

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
					{ title ? (
						<HStack
							spacing={ 10 * ratio }
							justify="center"
							style={ {
								height: '100%',
								overflow: 'hidden',
							} }
						>
							{ highlightedColors.map( ( color, index ) => (
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
					) : (
						<VStack
							spacing={ 3 * ratio }
							justify="center"
							style={ {
								height: '100%',
								overflow: 'hidden',
								padding: 10 * ratio,
								boxSizing: 'border-box',
							} }
						>
							<div
								style={ {
									fontSize: 40 * ratio,
									fontFamily: headingFontFamily,
									color: headingColor,
									fontWeight: headingFontWeight,
									lineHeight: '1em',
									textAlign: 'center',
								} }
							>
								{ translate( 'Default', {
									comment: 'The default value of the color palette',
								} ) }
							</div>
						</VStack>
					) }
				</div>
			</div>
		</GlobalStylesVariationContainer>
	);
};

export default ColorPaletteVariationPreview;
