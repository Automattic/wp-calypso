import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import {
	useSetting,
	useStyle,
} from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import { translate } from 'i18n-calypso';
import {
	STYLE_PREVIEW_WIDTH,
	STYLE_PREVIEW_HEIGHT,
	STYLE_PREVIEW_COLOR_SWATCH_SIZE,
} from '../../constants';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import type { Color } from '../../types';

interface Props {
	title?: string;
}

const ColorPaletteVariationPreview = ( { title }: Props ) => {
	const [ fontWeight ] = useStyle( 'typography.fontWeight' );
	const [ fontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ headingFontFamily = fontFamily ] = useStyle( 'elements.h1.typography.fontFamily' );
	const [ headingFontWeight = fontWeight ] = useStyle( 'elements.h1.typography.fontWeight' );
	const [ textColor = 'black' ] = useStyle( 'color.text' );
	const [ headingColor = textColor ] = useStyle( 'elements.h1.color.text' );
	const [ backgroundColor = 'white' ] = useStyle( 'color.background' );
	const [ gradientValue ] = useStyle( 'color.gradient' );
	const [ themeColors ] = useSetting( 'color.palette.theme' );
	const [ containerResizeListener, { width } ] = useResizeObserver();
	const ratio = width ? width / STYLE_PREVIEW_WIDTH : 1;

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
			ratio={ ratio }
			containerResizeListener={ containerResizeListener }
		>
			<div
				style={ {
					height: STYLE_PREVIEW_HEIGHT * ratio,
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
							<VStack spacing={ 4 * ratio }>
								{ highlightedColors.map( ( color, index ) => (
									<div
										key={ index }
										style={ {
											height: STYLE_PREVIEW_COLOR_SWATCH_SIZE * ratio,
											width: STYLE_PREVIEW_COLOR_SWATCH_SIZE * ratio,
											background: color,
											borderRadius: ( STYLE_PREVIEW_COLOR_SWATCH_SIZE * ratio ) / 2,
										} }
									/>
								) ) }
							</VStack>
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
								{ translate( 'Default' ) }
							</div>
						</VStack>
					) }
				</div>
			</div>
		</GlobalStylesVariationContainer>
	);
};

export default ColorPaletteVariationPreview;
