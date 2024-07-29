import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver, useViewportMatch } from '@wordpress/compose';
import { useMemo, useState } from 'react';
import {
	FONT_PREVIEW_LARGE_WIDTH,
	FONT_PREVIEW_LARGE_HEIGHT,
	FONT_PREVIEW_WIDTH,
	FONT_PREVIEW_HEIGHT,
	SYSTEM_FONT_SLUG,
} from '../../constants';
import { useGlobalSetting, useGlobalStyle } from '../../gutenberg-bridge';
import GlobalStylesVariationContainer from '../global-styles-variation-container';
import FontFamiliesLoader from './font-families-loader';
import type { FontFamily } from '../../types';

const DEFAULT_LARGE_FONT_STYLES: React.CSSProperties = {
	fontSize: '13vw', // 18px for min-width wide breakpoint and 15px for max-width wide
	lineHeight: '20px',
	color: '#000000',
};

const FontPairingVariationPreview = () => {
	const [ defaultFontFamilies ] = useGlobalSetting( 'typography.fontFamilies.default' ) as [
		FontFamily[],
	];
	const [ themeFontFamilies ] = useGlobalSetting( 'typography.fontFamilies.theme' ) as [
		FontFamily[],
	];
	const [ textFontFamily = 'serif' ] = useGlobalStyle( 'typography.fontFamily' );
	const [ textFontStyle = 'normal' ] = useGlobalStyle( 'typography.fontStyle' );
	const [ textLetterSpacing = '-0.15px' ] = useGlobalStyle( 'typography.letterSpacing' );
	const [ textFontWeight = 400 ] = useGlobalStyle( 'typography.fontWeight' );

	const [ baseHeadingFontFamily = textFontFamily ] = useGlobalStyle(
		'elements.heading.typography.fontFamily'
	);
	const [ baseHeadingFontStyle = textFontStyle ] = useGlobalStyle(
		'elements.heading.typography.fontStyle'
	);
	const [ baseHeadingFontWeight = textFontWeight ] = useGlobalStyle(
		'elements.heading.typography.fontWeight'
	);
	const [ baseHeadingLetterSpacing = textLetterSpacing ] = useGlobalStyle(
		'elements.heading.typography.letterSpacing'
	);

	const [ headingFontFamily = baseHeadingFontFamily ] = useGlobalStyle(
		'elements.h1.typography.fontFamily'
	);
	const [ headingFontStyle = baseHeadingFontStyle ] = useGlobalStyle(
		'elements.h1.typography.fontStyle'
	);
	const [ headingFontWeight = baseHeadingFontWeight ] = useGlobalStyle(
		'elements.h1.typography.fontWeight'
	);
	const [ headingLetterSpacing = baseHeadingLetterSpacing ] = useGlobalStyle(
		'elements.h1.typography.letterSpacing'
	);

	const [ containerResizeListener, { width } ] = useResizeObserver();
	const isDesktop = useViewportMatch( 'large' );
	const defaultWidth = isDesktop ? FONT_PREVIEW_LARGE_WIDTH : FONT_PREVIEW_WIDTH;
	const defaultHeight = isDesktop ? FONT_PREVIEW_LARGE_HEIGHT : FONT_PREVIEW_HEIGHT;
	const ratio = width ? width / defaultWidth : 1;
	const normalizedHeight = Math.ceil( defaultHeight * ratio );
	const fontFamilies = useMemo(
		() => [ ...defaultFontFamilies, ...themeFontFamilies ],
		[ defaultFontFamilies, themeFontFamilies ]
	);

	const getFontFamilyName = ( targetFontFamily: string ) => {
		const fontFamily = fontFamilies.find( ( { fontFamily } ) => fontFamily === targetFontFamily );
		return fontFamily?.name || fontFamily?.fontFamily || targetFontFamily;
	};

	const textFontFamilyName = useMemo(
		() => getFontFamilyName( textFontFamily ),
		[ textFontFamily, fontFamilies ]
	);

	const headingFontFamilyName = useMemo(
		() => getFontFamilyName( headingFontFamily ),
		[ headingFontFamily, fontFamilies ]
	);

	const externalFontFamilies = fontFamilies
		.filter( ( { slug } ) => slug !== SYSTEM_FONT_SLUG )
		.filter( ( { fontFamily } ) => [ textFontFamily, headingFontFamily ].includes( fontFamily ) );

	const [ isLoaded, setIsLoaded ] = useState( ! externalFontFamilies.length );

	const handleOnLoad = () => setIsLoaded( true );

	return (
		<GlobalStylesVariationContainer
			width={ width }
			height={ normalizedHeight }
			containerResizeListener={ containerResizeListener }
		>
			<>
				<div
					style={ {
						// Apply the normalized height only when the width is available
						height: width ? normalizedHeight : 0,
						width: '100%',
						background: 'white',
						cursor: 'pointer',
					} }
				>
					<div
						style={ {
							height: '100%',
							overflow: 'hidden',
							opacity: isLoaded ? 1 : 0,
						} }
					>
						<HStack
							spacing={ 10 * ratio }
							justify="flex-start"
							style={ {
								height: '100%',
								overflow: 'hidden',
							} }
						>
							<VStack
								spacing={ 1 }
								style={ {
									margin: '10px',
									width: '100%',
									textAlign: isDesktop ? 'center' : 'left',
								} }
							>
								<div
									aria-label={ headingFontFamilyName }
									style={ {
										...DEFAULT_LARGE_FONT_STYLES,
										letterSpacing: headingLetterSpacing,
										fontWeight: headingFontWeight,
										fontFamily: headingFontFamily,
										fontStyle: headingFontStyle,
									} }
								>
									{ headingFontFamilyName }
								</div>
								<div
									aria-label={ textFontFamilyName }
									style={ {
										...DEFAULT_LARGE_FONT_STYLES,
										fontSize: '13px',
										letterSpacing: textLetterSpacing,
										fontWeight: textFontWeight,
										fontFamily: textFontFamily,
										fontStyle: textFontStyle,
									} }
								>
									{ textFontFamilyName }
								</div>
							</VStack>
						</HStack>
					</div>
				</div>
				<FontFamiliesLoader fontFamilies={ externalFontFamilies } onLoad={ handleOnLoad } />
			</>
		</GlobalStylesVariationContainer>
	);
};

export default FontPairingVariationPreview;
