import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import {
	useSetting,
	useStyle,
} from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import {
	STYLE_PREVIEW_WIDTH,
	STYLE_PREVIEW_HEIGHT,
	STYLE_PREVIEW_COLOR_SWATCH_SIZE,
} from '../../constants';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import type { Color } from '../../types';

const ColorPaletteVariationPreview = () => {
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
				</div>
			</div>
		</GlobalStylesVariationContainer>
	);
};

export default ColorPaletteVariationPreview;
